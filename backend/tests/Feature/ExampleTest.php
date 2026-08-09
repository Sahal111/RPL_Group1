<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    /**
     * Health check endpoint tersedia.
     * Laravel otomatis register /up via withRouting(health: '/up').
     */
    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->get('/up');

        $response->assertStatus(200);
    }
}