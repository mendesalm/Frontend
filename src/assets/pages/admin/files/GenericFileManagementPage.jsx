// src/assets/pages/admin/files/GenericFileManagementPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../../../hooks/useAuth";
import { useDataFetching } from "../../../../hooks/useDataFetching";
import Modal from "../../../../components/modal/Modal";
import GenericFileForm from "../../../../components/forms/GenericFileForm";
import "../../../../assets/styles/TableStyles.css";
import {
  showSuccessToast,
  showErrorToast,
} from "../../../../utils/notifications";


// Importações dos serviços e validadores
import * as legislacaoService from "../../../../services/legislacaoService";
import { legislacaoValidationSchema } from "../../../../validators/legislacaoValidator";
import * as documentoService from "../../../../services/documentoService";
import { documentoValidationSchema } from "../../../../validators/documentoValidator";
import * as arquivoService from "../../../../services/arquivoService";
import { arquivoValidationSchema } from "../../../../validators/arquivoValidator";

const GenericFileManagementPage = ({
  pageTitle,
  permissionName,
  apiService,
  validationSchema,
}) => {
  const {
    // CORREÇÃO: A propriedade 'data' do hook foi diretamente renomeada para 'items'.
    data: items = [], // Adicionado um valor padrão de array vazio para segurança.
    isLoading,
    error: fetchError,
    refetch,
    setState,
  } = useDataFetching(apiService.getAll);

  // A linha 'const items = response?.data || [];' foi removida, pois era a causa do erro.

  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const isAdmin =
    user?.credencialAcesso === "Webmaster" ||
    user?.credencialAcesso === "Diretoria";
  const hasPermission = user?.permissoes?.some(
    (p) => p.nomeFuncionalidade === permissionName
  );
  const canManage = isAdmin || hasPermission;

  const handleSave = async (formData) => {
    try {
      if (currentItem) {
        const response = await apiService.update(currentItem.id, formData);
        setState((currentState) => ({
          ...currentState,
          data: currentState.data.map((item) =>
            item.id === currentItem.id ? response.data : item
          ),
        }));
        showSuccessToast("Item atualizado com sucesso!");
      } else {
        const response = await apiService.create(formData);
        setState((currentState) => ({
          ...currentState,
          data: [response.data, ...currentState.data],
        }));
        showSuccessToast("Item criado com sucesso!");
      }
      setIsModalOpen(false);
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Erro ao guardar o item.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem a certeza que deseja apagar este item?")) {
      try {
        await apiService.deleteItem(id);
        showSuccessToast("Item apagado com sucesso!");
        refetch();
      } catch (err) {
        console.error(err);
        showErrorToast("Não foi possível apagar o item.");
      }
    }
  };

  const getFileUrl = (path) => {
    if (!path) {
      return "";
    }
    // Garante que o caminho retornado seja sempre um caminho de URL relativo à raiz.
    // Se o caminho já começar com uma barra, usa-o como está.
    // Caso contrário, adiciona uma barra no início.
    return path.startsWith('/') ? path : `/${path}`;
  };

  const openCreateModal = () => {
    setCurrentItem(null);
    setIsModalOpen(true);
  };
  const openEditModal = (item) => {
    setCurrentItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="table-page-container">
      <div className="table-header">
        <h1>{pageTitle}</h1>
        {canManage && (
          <button onClick={openCreateModal} className="btn-action btn-approve">
            + Adicionar Novo
          </button>
        )}
      </div>

      {fetchError && <p className="error-message">{fetchError}</p>}

      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data de Publicação</th>
              <th>Autor</th>
              <th>Ficheiro</th>
              {canManage && <th>Ações</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={canManage ? 5 : 4}>A carregar...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4}>Nenhum item encontrado.</td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.titulo}</td>
                  <td>{new Date(item.dataPublicacao).toLocaleDateString()}</td>
                  <td>{item.autor?.NomeCompleto || "N/A"}</td>
                  <td>
                    <a
                      href={getFileUrl(item.caminhoArquivo)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary"
                    >
                      Ver
                    </a>
                  </td>
                  {canManage && (
                    <td className="actions-cell">
                      <button
                        onClick={() => openEditModal(item)}
                        className="btn-action btn-edit"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn-action btn-delete"
                      >
                        Apagar
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={currentItem ? "Editar Item" : "Adicionar Novo Item"}
      >
        <GenericFileForm
          itemToEdit={currentItem}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
          validationSchema={validationSchema}
        />
      </Modal>
    </div>
  );
};

// Componentes de Página específicos que utilizam o genérico
export const LegislacoesPage = () => (
  <GenericFileManagementPage
    pageTitle="Gestão de Legislações"
    permissionName="gerenciar-legislacao"
    apiService={legislacaoService}
    validationSchema={legislacaoValidationSchema}
  />
);

export const DocumentosPage = () => (
  <GenericFileManagementPage
    pageTitle="Gestão de Documentos"
    permissionName="gerenciar-documentos"
    apiService={documentoService}
    validationSchema={documentoValidationSchema}
  />
);

export const ArquivosPage = () => (
  <GenericFileManagementPage
    pageTitle="Gestão de Arquivos Diversos"
    permissionName="gerenciar-arquivos-diversos"
    apiService={arquivoService}
    validationSchema={arquivoValidationSchema}
  />
);