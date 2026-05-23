import { useState } from "react";
import axios from "axios";
import "../index.css";

function RenameDialog({
  open,
  onClose,
  file,
  token,
  onRenameSuccess,
}) {
  const [newName, setNewName] = useState(file?.filename || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !file) return null;

  const handleRename = async () => {
    if (!newName.trim()) {
      setError("Filename cannot be empty");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await axios.post(
        "http://localhost:5000/file/rename",
        {
          id: file.id,
          new_name: newName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onRenameSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || "Rename failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-2xl p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-semibold">
            Rename File
          </h2>
        </div>

        {/* File Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-1">
            Current Name
          </p>

          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
            {file.filename}
          </div>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label className="text-sm text-gray-600">
            New Name
          </label>

          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="in"
            placeholder="Enter new filename"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            title="Cancel"
            onClick={onClose}
            className="cancelBtn"
          >
            Cancel
          </button>

          <button
            title={`Rename ${file.filename}`}
            onClick={handleRename}
            disabled={loading}
            className="renameBtn"
          >
            {loading ? "Renaming..." : "Rename"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RenameDialog;