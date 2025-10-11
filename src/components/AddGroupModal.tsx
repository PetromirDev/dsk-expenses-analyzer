/**
 * Add Group Modal Component
 * Modal dialog for adding a new custom group using shadcn Dialog
 */

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

interface AddGroupModalProps {
  isOpen: boolean
  onClose: () => void
  groupName: string
  onGroupNameChange: (value: string) => void
  onSave: () => boolean // Return boolean to indicate success
}

export function AddGroupModal({
  isOpen,
  onClose,
  groupName,
  onGroupNameChange,
  onSave
}: AddGroupModalProps) {
  const handleSave = () => {
    if (groupName.trim()) {
      const success = onSave()
      if (success) {
        onClose()
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && groupName.trim()) {
      handleSave()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добави нова група</DialogTitle>
          <DialogDescription>
            Създайте нова персонализирана група за класификация на транзакциите си
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Име на групата</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => onGroupNameChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Например: Застраховки"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            autoFocus
          />
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Отказ
          </button>
          <button
            onClick={handleSave}
            disabled={!groupName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Добави
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
