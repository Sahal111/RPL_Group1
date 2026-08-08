<?php

namespace App\Services\Excel;

/**
 * Menangani build & parse file XLSX multi-sheet secara manual via ZipArchive + SimpleXML.
 *
 * Diekstrak dari GuruImportController & GuruExportController yang sebelumnya
 * menduplikasi keempat method ini identik.
 *
 * Gunakan via dependency injection atau new MultiSheetXlsxService().
 */
class MultiSheetXlsxService
{
    /**
     * Bangun file XLSX multi-sheet dari array sheet definitions.
     *
     * @param  array<int, array{name: string, headers: string[], rows: array[]}> $sheets
     */
    public function build(array $sheets): string
    {
        $spreadsheet = new \PhpOffice\PhpSpreadsheet\Spreadsheet();
        $spreadsheet->removeSheetByIndex(0);

        foreach ($sheets as $si => $sheet) {
            $ws = new \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet($spreadsheet, $sheet['name']);
            $spreadsheet->addSheet($ws, $si);

            foreach ($sheet['headers'] as $ci => $header) {
                $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($ci + 1);
                $cell = $ws->getCell("{$col}1");
                $cell->setValue($header);
                $cell->getStyle()->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                    'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '5B21B6']],
                    'alignment' => ['horizontal' => 'center'],
                ]);
            }

            foreach ($sheet['rows'] as $ri => $row) {
                $rowNum = $ri + 2;
                $bg = $ri % 2 === 0 ? 'FFFFFF' : 'F5F3FF';
                foreach ($row as $ci => $val) {
                    $col = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($ci + 1);
                    $cell = $ws->getCell("{$col}{$rowNum}");
                    $cell->setValueExplicit((string) $val, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
                    $cell->getStyle()->getFill()->setFillType('solid')->getStartColor()->setRGB($bg);
                }
            }

            foreach (range(1, count($sheet['headers'])) as $colIdx) {
                $ws->getColumnDimensionByColumn($colIdx)->setAutoSize(true);
            }
        }

        $writer = new \PhpOffice\PhpSpreadsheet\Writer\Xlsx($spreadsheet);
        ob_start();
        $writer->save('php://output');
        return ob_get_clean();
    }

    /**
     * Parse file XLSX multi-sheet dari path lokal.
     *
     * @return array<int, array{name: string, rows: array[]}>
     */
    public function parse(string $filePath): array
    {
        $zip = new \ZipArchive();
        if ($zip->open($filePath) !== true) {
            return [];
        }

        $sharedStrings = $this->extractSharedStrings($zip);
        $sheetList = $this->extractSheetList($zip);

        $result = [];
        foreach ($sheetList as $sheetMeta) {
            $sheetXml = $zip->getFromName($sheetMeta['path']);
            if ($sheetXml === false) {
                continue;
            }

            $sheet = simplexml_load_string($sheetXml);
            $rows = [];

            foreach ($sheet->sheetData->row as $row) {
                $rowArr = [];
                $maxCol = 0;

                foreach ($row->c as $cell) {
                    $ref = (string) $cell['r'];
                    $colIdx = $this->colLetterToIndex(preg_replace('/[0-9]/', '', $ref));
                    $maxCol = max($maxCol, $colIdx);
                    $t = (string) $cell['t'];
                    $val = isset($cell->v) ? (string) $cell->v : '';

                    if ($t === 's' && $val !== '') {
                        $val = $sharedStrings[(int) $val] ?? '';
                    }

                    $rowArr[$colIdx] = $val;
                }

                for ($i = 0; $i <= $maxCol; $i++) {
                    $rowArr[$i] ??= '';
                }

                ksort($rowArr);
                $rows[] = array_values($rowArr);
            }

            $result[] = ['name' => $sheetMeta['name'], 'rows' => $rows];
        }

        $zip->close();
        return $result;
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private function extractSharedStrings(\ZipArchive $zip): array
    {
        $sharedStrings = [];
        $ssXml = $zip->getFromName('xl/sharedStrings.xml');

        if ($ssXml !== false) {
            $ss = simplexml_load_string($ssXml);
            foreach ($ss->si as $si) {
                $t = '';
                foreach ($si->r as $r) {
                    $t .= (string) $r->t;
                }
                if ($t === '' && isset($si->t)) {
                    $t = (string) $si->t;
                }
                $sharedStrings[] = $t;
            }
        }

        return $sharedStrings;
    }

    private function extractSheetList(\ZipArchive $zip): array
    {
        $wbXml = $zip->getFromName('xl/workbook.xml');
        $wbRelsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');

        if ($wbXml && $wbRelsXml) {
            return $this->extractSheetListFromWorkbook($wbXml, $wbRelsXml);
        }

        // Fallback: try sheet1..sheetN
        $sheetList = [];
        for ($i = 1; $i <= 15; $i++) {
            $path = "xl/worksheets/sheet{$i}.xml";
            if ($zip->getFromName($path) !== false) {
                $sheetList[] = ['name' => "Sheet{$i}", 'path' => $path];
            }
        }
        return $sheetList;
    }

    private function extractSheetListFromWorkbook(string $wbXml, string $wbRelsXml): array
    {
        $wb = simplexml_load_string($wbXml);
        $wbRels = simplexml_load_string($wbRelsXml);

        $relMap = [];
        foreach ($wbRels->Relationship as $rel) {
            $relMap[(string) $rel['Id']] = (string) $rel['Target'];
        }

        $ns = $wb->getNamespaces(true);
        $rNs = $ns['r'] ?? 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

        $sheetList = [];
        foreach ($wb->sheets->sheet as $sheet) {
            $rId = (string) $sheet->attributes($rNs)['id'];
            $target = $relMap[$rId] ?? null;
            if (!$target) {
                continue;
            }
            $path = str_starts_with($target, '/') ? ltrim($target, '/') : 'xl/' . $target;
            $sheetList[] = ['name' => (string) $sheet['name'], 'path' => $path];
        }

        return $sheetList;
    }

    public function colLetterToIndex(string $col): int
    {
        $col = strtoupper($col);
        $index = 0;
        for ($i = 0; $i < strlen($col); $i++) {
            $index = $index * 26 + (ord($col[$i]) - 64);
        }
        return $index - 1;
    }

    public function indexToColLetter(int $index): string
    {
        $letter = '';
        $index++;
        while ($index > 0) {
            $index--;
            $letter = chr(65 + ($index % 26)) . $letter;
            $index = intdiv($index, 26);
        }
        return $letter;
    }
}