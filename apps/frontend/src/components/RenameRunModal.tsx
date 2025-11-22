import { useState, useEffect } from "react";
import Modal from "./Modal";
import Input from "./Input";
import Button from "./Button";
import { theme } from "../styles/theme";

interface RenameRunModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (name: string) => Promise<void>;
  currentName?: string;
  isLoading?: boolean;
}

export default function RenameRunModal({
  isOpen,
  onClose,
  onRename,
  currentName = "",
  isLoading = false,
}: RenameRunModalProps) {
  const [name, setName] = useState(currentName);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    try {
      await onRename(trimmedName);
      onClose();
    } catch (err) {
      console.error("Rename error:", err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rename Run">
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          value={name}
          onChange={setName}
          label="Run Name"
          placeholder="Enter a descriptive name..."
          maxLength={100}
          required
          autoFocus
        />

        <div style={{
          display: "flex",
          gap: theme.spacing.md,
          justifyContent: "flex-end",
          marginTop: theme.spacing.lg,
        }}>
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading || !name.trim()}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
