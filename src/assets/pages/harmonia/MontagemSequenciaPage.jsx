// src/assets/pages/harmonia/MontagemSequenciaPage.jsx (Refatorado)

import React, { useState, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDataFetching } from "../../../hooks/useDataFetching";
import {
  getTiposSessao,
  createTipoSessao,
  updateTipoSessao,
  deleteTipoSessao,
} from "../../../services/harmoniaService";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";
import ConfirmationModal from "../../../components/modal/ConfirmationModal";
import LoadingOverlay from "../../../components/layout/LoadingOverlay";
import "./MontagemSequenciaPage.css"; // Estilos serão atualizados/criados
import "../../../assets/styles/FormStyles.css";

import TipoSessaoModal from './modals/TipoSessaoModal';
import SequenciaEditorModal from './modals/SequenciaEditorModal';

const ItemTypes = {
  TIPO_SESSAO_ROW: "tipo_sessao_row",
};

// Componente da Linha da Tabela Arrastável
const DraggableTipoSessaoRow = ({ tipoSessao, index, moveRow, onEdit, onManageSequence, onDelete }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.TIPO_SESSAO_ROW,
    hover(item) {
      if (item.index !== index) {
        moveRow(item.index, index);
        item.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TIPO_SESSAO_ROW,
    item: { id: tipoSessao.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const trClasses = [
    isDragging ? "dragging" : "",
    tipoSessao.playlists?.length === 0 ? "tipo-sessao-vazio" : ""
  ].join(" ").trim();

  return (
    <tr ref={ref} className={trClasses}>
      <td>{tipoSessao.nome}</td>
      <td>{tipoSessao.playlists?.length || 0}</td>
      <td className="actions-cell">
        <button onClick={() => onManageSequence(tipoSessao)} className="btn-action btn-manage-sequence">Gerenciar Sequência</button>
        <button onClick={() => onEdit(tipoSessao)} className="btn-action btn-edit">Editar</button>
        <button onClick={() => onDelete(tipoSessao)} className="btn-action btn-delete">Excluir</button>
      </td>
    </tr>
  );
};


const MontagemSequenciaPage = () => {
  const {
    data: tiposSessao,
    isLoading,
    error,
    refetch,
  } = useDataFetching(getTiposSessao);

  const [filtro, setFiltro] = useState("");
  
  // Estados para os modais
  const [isTipoSessaoModalOpen, setIsTipoSessaoModalOpen] = useState(false);
  const [isSequenciaEditorModalOpen, setIsSequenciaEditorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentTipoSessao, setCurrentTipoSessao] = useState(null);

  const tiposSessaoFiltrados = useMemo(() => {
    if (!tiposSessao) return [];
    return tiposSessao.filter((ts) =>
      ts.nome.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [tiposSessao, filtro]);

  // Placeholder para a função de mover a linha
  const moveRow = (fromIndex, toIndex) => {
    console.log(`Mover tipo de sessão da posição ${fromIndex} para ${toIndex}`);
    // Lógica de reordenação a ser implementada
  };

  // Funções para abrir os modais
  const handleOpenCreateModal = () => {
    setCurrentTipoSessao(null);
    setIsTipoSessaoModalOpen(true);
  };

  const handleOpenEditModal = (tipoSessao) => {
    setCurrentTipoSessao(tipoSessao);
    setIsTipoSessaoModalOpen(true);
  };
  
  const handleOpenManageSequenceModal = (tipoSessao) => {
    setCurrentTipoSessao(tipoSessao);
    setIsSequenciaEditorModalOpen(true);
  };

  const handleOpenDeleteModal = (tipoSessao) => {
    setCurrentTipoSessao(tipoSessao);
    setIsDeleteModalOpen(true);
  };

  const handleSaveTipoSessao = async (tipoSessaoData) => {
    try {
      if (tipoSessaoData.id) {
        // Atualizar tipo de sessão existente
        await updateTipoSessao(tipoSessaoData.id, { nome: tipoSessaoData.nome });
        showSuccessToast("Tipo de Sessão atualizado com sucesso!");
      } else {
        // Criar novo tipo de sessão
        await createTipoSessao({ nome: tipoSessaoData.nome });
        showSuccessToast("Tipo de Sessão criado com sucesso!");
      }
      refetch();
      setIsTipoSessaoModalOpen(false);
    } catch (err) {
      showErrorToast(tipoSessaoData.id ? "Falha ao atualizar o Tipo de Sessão." : "Falha ao criar o Tipo de Sessão.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentTipoSessao) return;
    try {
      await deleteTipoSessao(currentTipoSessao.id);
      showSuccessToast("Tipo de Sessão excluído com sucesso!");
      refetch();
      setIsDeleteModalOpen(false);
    } catch (err) {
      showErrorToast("Falha ao excluir o Tipo de Sessão.");
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="montagem-container">
        <div className="header-container">
          <h1>Montagem de Sequências</h1>
          <button onClick={handleOpenCreateModal} className="btn btn-primary btn-fixed-right">
            + Adicionar Tipo de Sessão
          </button>
        </div>

        <input
          type="text"
          placeholder="Filtrar por nome do tipo de sessão..."
          className="form-input filtro-input"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />

        {isLoading && <LoadingOverlay isLoading={isLoading} />}
        {error && <p className="error-message">{error}</p>}

        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Nome do Tipo de Sessão</th>
                <th>Nº de Playlists</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {tiposSessaoFiltrados.map((tipoSessao, index) => (
                <DraggableTipoSessaoRow
                  key={tipoSessao.id}
                  index={index}
                  tipoSessao={tipoSessao}
                  moveRow={moveRow}
                  onManageSequence={handleOpenManageSequenceModal}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Placeholder para os modais */}
                <TipoSessaoModal
          isOpen={isTipoSessaoModalOpen}
          onClose={() => setIsTipoSessaoModalOpen(false)}
          onSave={handleSaveTipoSessao}
          tipoSessao={currentTipoSessao}
        />

                <SequenciaEditorModal
          isOpen={isSequenciaEditorModalOpen}
          onClose={() => setIsSequenciaEditorModalOpen(false)}
          tipoSessao={currentTipoSessao}
          onSequenceSaved={() => {
            refetch(); // Atualiza a lista de tipos de sessão para refletir a nova contagem de playlists
          }}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o tipo de sessão "${currentTipoSessao?.nome}"? Isso removerá todas as sequências associadas.`}
        />
      </div>
    </DndProvider>
  );
};

export default MontagemSequenciaPage;