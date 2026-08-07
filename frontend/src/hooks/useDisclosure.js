import { useState, useCallback } from "react";

/**
 * useDisclosure — manajemen state open/close untuk modal, drawer, dropdown
 * Returns: { isOpen, onOpen, onClose, onToggle }
 */
export default function useDisclosure(initialState = false) {
  const [isOpen, setIsOpen] = useState(initialState);
  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen((prev) => !prev), []);
  return { isOpen, onOpen, onClose, onToggle };
}
