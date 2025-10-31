import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/store/auth';
import { useAppStore } from '@/store/app';
import { toast } from 'sonner';

interface DeleteAssetButtonProps {
  assetId: string;
  assetName: string;
  onDeleteSuccess?: () => void;
}

export const DeleteAssetButton: React.FC<DeleteAssetButtonProps> = ({
  assetId,
  assetName,
  onDeleteSuccess,
}) => {
  const { user } = useAuthStore();
  const { deleteAsset } = useAppStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Apenas Owner e Admin podem deletar
  const canDelete = user?.role === 'owner' || user?.role === 'admin';

  if (!canDelete) {
    return null; // Não renderiza o botão para usuários sem permissão
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteAsset(assetId);
      toast.success('Equipamento excluído com sucesso', {
        description: `${assetName} foi removido do sistema.`,
      });
      setIsOpen(false);
      onDeleteSuccess?.();
    } catch (error) {
      console.error('Erro ao deletar asset:', error);
      toast.error('Erro ao excluir equipamento', {
        description: 'Não foi possível excluir o equipamento. Tente novamente.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
          title="Excluir equipamento"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Excluir</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Tem certeza que deseja excluir o equipamento{' '}
              <span className="font-semibold text-foreground">{assetName}</span>?
            </p>
            <p className="text-red-600 font-medium">
              ⚠️ Esta ação não pode ser desfeita e irá remover permanentemente:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm pl-2">
              <li>O equipamento e suas configurações</li>
              <li>Todos os dispositivos vinculados</li>
              <li>Todos os sensores associados</li>
              <li>Histórico de telemetria</li>
              <li>Alertas e regras relacionadas</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Permanentemente
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
