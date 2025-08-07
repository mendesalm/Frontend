// src/assets/pages/harmonia/GestaoPlaylistsPage.jsx (Refatorado)

import React, { useState, useMemo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDataFetching } from "../../../hooks/useDataFetching";
import {
  getPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  // As funções de música serão usadas nos modais
} from "../../../services/harmoniaService";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";
import ConfirmationModal from "../../../components/modal/ConfirmationModal";
import LoadingOverlay from "../../../components/layout/LoadingOverlay";
import "./GestaoPlaylistsPage.css"; // Estilos serão atualizados/criados
import "../../../assets/styles/FormStyles.css";

import PlaylistModal from './modals/PlaylistModal';
import MusicasModal from './modals/MusicasModal';
import SelecionarMusicasModal from './modals/SelecionarMusicasModal';


const ItemTypes = {
  PLAYLIST_ROW: "playlist_row",
};

// Componente da Linha da Tabela Arrastável
const DraggablePlaylistRow = ({ playlist, index, moveRow, onEdit, onAddMusicas, onViewMusicas, onDelete }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.PLAYLIST_ROW,
    hover(item) {
      if (item.index !== index) {
        moveRow(item.index, index);
        item.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PLAYLIST_ROW,
    item: { id: playlist.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const trClasses = [
    isDragging ? "dragging" : "",
    playlist.musicas?.length === 0 ? "playlist-vazia" : ""
  ].join(" ").trim();

  return (
    <tr ref={ref} className={trClasses}>
      <td>{playlist.nome}</td>
      <td>{playlist.musicas?.length || 0}</td>
      <td className="actions-cell">
        <button onClick={() => onAddMusicas(playlist)} className="btn-action btn-add-music">Adicionar Músicas</button>
        <button onClick={() => onViewMusicas(playlist)} className="btn-action btn-view">Visualizar</button>
        <button onClick={() => onEdit(playlist)} className="btn-action btn-edit">Editar</button>
        <button onClick={() => onDelete(playlist)} className="btn-action btn-delete">Excluir</button>
      </td>
    </tr>
  );
};


const GestaoPlaylistsPage = () => {
  console.log('GestaoPlaylistsPage re-rendered');
  const {
    data: playlists,
    isLoading,
    error,
    refetch,
  } = useDataFetching(getPlaylists);

  const [filtro, setFiltro] = useState("");
  
  // Estados para os modais
  const [isPlaylistModalOpen, setIsPlaylistModalOpen] = useState(false);
  const [isMusicasModalOpen, setIsMusicasModalOpen] = useState(false);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentPlaylist, setCurrentPlaylist] = useState(null);

  const playlistsFiltradas = useMemo(() => {
    if (!playlists) return [];
    return playlists.filter((p) =>
      p.nome.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [playlists, filtro]);

  // Placeholder para a função de mover a linha
  const moveRow = (fromIndex, toIndex) => {
    console.log(`Mover playlist da posição ${fromIndex} para ${toIndex}`);
    // Lógica de reordenação a ser implementada
  };

  // Funções para abrir os modais
  const handleOpenCreateModal = () => {
    setCurrentPlaylist(null);
    setIsPlaylistModalOpen(true);
  };

  const handleOpenEditModal = (playlist) => {
    setCurrentPlaylist(playlist);
    setIsPlaylistModalOpen(true);
  };
  
  const handleOpenAddMusicasModal = (playlist) => {
    setCurrentPlaylist(playlist);
    setIsSelectModalOpen(true);
  };

  const handleOpenViewMusicasModal = (playlist) => {
    setCurrentPlaylist(playlist);
    setIsMusicasModalOpen(true);
  };

  const handleOpenDeleteModal = (playlist) => {
    setCurrentPlaylist(playlist);
    setIsDeleteModalOpen(true);
  };

  const handleSavePlaylist = async (playlistData) => {
    try {
      if (playlistData.id) {
        // Atualizar playlist existente
        await updatePlaylist(playlistData.id, { nome: playlistData.nome });
        showSuccessToast("Playlist atualizada com sucesso!");
      } else {
        // Criar nova playlist
        await createPlaylist({ nome: playlistData.nome });
        showSuccessToast("Playlist criada com sucesso!");
      }
      refetch();
      setIsPlaylistModalOpen(false);
    } catch (err) {
      showErrorToast(playlistData.id ? "Falha ao atualizar a playlist." : "Falha ao criar a playlist.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!currentPlaylist) return;
    try {
      await deletePlaylist(currentPlaylist.id);
      showSuccessToast("Playlist excluída com sucesso!");
      refetch();
      setIsDeleteModalOpen(false);
    } catch (err) {
      showErrorToast("Falha ao excluir a playlist.");
    } 
  }; // Confirmação de exclusão de playlist

  

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="gestao-container">
        <div className="header-container">
          <h1>Gestão de Playlists</h1>
          <button onClick={handleOpenCreateModal} className="btn btn-primary btn-fixed-right">
            + Adicionar Playlist
          </button>
        </div>

        <input
          type="text"
          placeholder="Filtrar por nome da playlist..."
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
                <th>Nome da Playlist</th>
                <th>Nº de Músicas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {playlistsFiltradas.map((playlist, index) => (
                <DraggablePlaylistRow
                  key={playlist.id}
                  index={index}
                  playlist={playlist}
                  moveRow={moveRow}
                  onAddMusicas={handleOpenAddMusicasModal}
                  onViewMusicas={handleOpenViewMusicasModal}
                  onEdit={handleOpenEditModal}
                  onDelete={handleOpenDeleteModal}
                />
              ))}
            </tbody>
          </table>
        </div>

        <PlaylistModal
          isOpen={isPlaylistModalOpen}
          onClose={() => setIsPlaylistModalOpen(false)}
          onSave={handleSavePlaylist}
          playlist={currentPlaylist}
        />

                <MusicasModal
          isOpen={isMusicasModalOpen}
          onClose={() => setIsMusicasModalOpen(false)}
          playlist={currentPlaylist}
          onMusicRemoved={() => {
            refetch(); // Atualiza a lista de playlists para refletir a contagem de músicas
          }}
        />

                <SelecionarMusicasModal
          isOpen={isSelectModalOpen}
          onClose={() => setIsSelectModalOpen(false)}
          playlist={currentPlaylist}
          onMusicasAdd={() => {
            refetch(); // Atualiza a lista de playlists para refletir a nova contagem de músicas
          }}
        />

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir a playlist "${currentPlaylist?.nome}"? As músicas não serão apagadas da sua biblioteca.`}
        />
      </div>
    </DndProvider>
  );
};

export default GestaoPlaylistsPage;
