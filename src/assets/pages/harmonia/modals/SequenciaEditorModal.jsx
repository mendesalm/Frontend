// src/assets/pages/harmonia/modals/SequenciaEditorModal.jsx

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Modal from '../../../../components/modal/Modal';
import { useDataFetching } from '../../../../hooks/useDataFetching';
import { getPlaylists, setSequenciaPlaylist } from '../../../../services/harmoniaService';
import { showErrorToast, showSuccessToast } from '../../../../utils/notifications';
import './SequenciaEditorModal.css';

const ItemTypes = {
  PLAYLIST_SEQUENCE: "playlist_sequence",
};

const DragHandleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="drag-handle">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>
);

const ArrowUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>
);

const ArrowDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-7 7-7-7"/><path d="M12 5v14"/></svg>
);

// Componente para um item de playlist arrastável dentro da sequência
const DraggableSequencePlaylistItem = ({ playlist, index, movePlaylist, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.PLAYLIST_SEQUENCE,
    hover(item) {
      if (!ref.current) { return; }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) { return; }

      movePlaylist(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.PLAYLIST_SEQUENCE,
    item: { id: playlist.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div ref={ref} className="playlist-item draggable" style={{ opacity: isDragging ? 0.5 : 1 }}>
      <div className="playlist-item-content">
        <DragHandleIcon />
        <span>{index + 1}. {playlist.nome}</span>
      </div>
      <div className="playlist-item-actions">
        <button className="btn-action btn-move-up" onClick={onMoveUp} disabled={isFirst} title="Mover para cima">
          <ArrowUpIcon />
        </button>
        <button className="btn-action btn-move-down" onClick={onMoveDown} disabled={isLast} title="Mover para baixo">
          <ArrowDownIcon />
        </button>
        <button className="btn-action btn-delete" onClick={() => onRemove(playlist.id)} title="Remover da sequência">
          ×
        </button>
      </div>
    </div>
  );
};

const SequenciaEditorModal = ({ isOpen, onClose, tipoSessao, onSequenceSaved }) => {
  
  const { data: allPlaylists, isLoading: loadingAllPlaylists } = useDataFetching(getPlaylists);
  const [sequencia, setSequencia] = useState([]);

  useEffect(() => {
    if (tipoSessao && tipoSessao.playlists) {
      const playlistsOrdenadas = tipoSessao.playlists
        .filter(p => p.TipoSessaoPlaylist && typeof p.TipoSessaoPlaylist.ordem === 'number')
        .sort((a, b) => a.TipoSessaoPlaylist.ordem - b.TipoSessaoPlaylist.ordem);
      setSequencia(playlistsOrdenadas);
    } else {
      setSequencia([]);
    }
  }, [tipoSessao]);

  const playlistsDisponiveis = useMemo(() => {
    if (!allPlaylists) return [];
    const sequenciaIds = new Set(sequencia.map(p => p.id));
    return allPlaylists.filter(p => !sequenciaIds.has(p.id));
  }, [allPlaylists, sequencia]);

  const handleAddPlaylist = (playlist) => {
    setSequencia(prev => [...prev, playlist]);
  };

  const handleRemovePlaylist = (playlistId) => {
    setSequencia(prev => prev.filter(p => p.id !== playlistId));
  };

  const movePlaylist = (fromIndex, toIndex) => {
    const updatedSequencia = [...sequencia];
    const [movedPlaylist] = updatedSequencia.splice(fromIndex, 1);
    updatedSequencia.splice(toIndex, 0, movedPlaylist);
    setSequencia(updatedSequencia);
  };

  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updatedSequencia = [...sequencia];
    const [movedPlaylist] = updatedSequencia.splice(index, 1);
    updatedSequencia.splice(index - 1, 0, movedPlaylist);
    setSequencia(updatedSequencia);
  };

  const handleMoveDown = (index) => {
    if (index === sequencia.length - 1) return;
    const updatedSequencia = [...sequencia];
    const [movedPlaylist] = updatedSequencia.splice(index, 1);
    updatedSequencia.splice(index + 1, 0, movedPlaylist);
    setSequencia(updatedSequencia);
  };

  const handleSaveSequencia = async () => {
    if (!tipoSessao) {
      showErrorToast("Nenhum Tipo de Sessão selecionado.");
      return;
    }

    const payload = sequencia.map((playlist, index) => ({
      playlistId: playlist.id,
      ordem: index + 1,
    }));

    try {
      await setSequenciaPlaylist(tipoSessao.id, payload);
      showSuccessToast("Sequência salva com sucesso!");
      onSequenceSaved(); // Callback para atualizar a página principal
      onClose();
    } catch (error) {
      showErrorToast("Erro ao salvar sequência.");
      console.error(error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Gerenciar Sequência para "${tipoSessao?.nome}"`}>
      <DndProvider backend={HTML5Backend}>
        <div className="sequencia-editor-layout">
          <div className="playlists-disponiveis-column">
            <h4>Playlists Disponíveis</h4>
            {loadingAllPlaylists ? <p>Carregando playlists...</p> : (
              playlistsDisponiveis.length > 0 ? (
                <div className="playlist-list">
                  {playlistsDisponiveis.map(p => (
                    <div key={p.id} className="playlist-item">
                      <span>{p.nome}</span>
                      <button className="btn-action btn-add" onClick={() => handleAddPlaylist(p)}>
                        +
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Todas as playlists já estão na sequência ou não há playlists disponíveis.</p>
              )
            )}
          </div>

          <div className="sequencia-atual-column">
            <h4>Sequência Atual</h4>
            {sequencia.length > 0 ? (
              <div className="playlist-list">
                <p className="drag-instruction">Arraste e solte para reordenar:</p>
                {sequencia.map((p, index) => (
                  <DraggableSequencePlaylistItem
                    key={p.id}
                    index={index}
                    playlist={p}
                    movePlaylist={movePlaylist}
                    onRemove={handleRemovePlaylist}
                    onMoveUp={() => handleMoveUp(index)}
                    onMoveDown={() => handleMoveDown(index)}
                    isFirst={index === 0}
                    isLast={index === sequencia.length - 1}
                  />
                ))}
              </div>
            ) : (
              <p>Arraste playlists da coluna ao lado para montar a sequência.</p>
            )}
          </div>
        </div>
      </DndProvider>
      <div className="modal-actions">
        <button onClick={handleSaveSequencia} className="btn btn-primary">Salvar Sequência</button>
        <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
      </div>
    </Modal>
  );
};

export default SequenciaEditorModal;
