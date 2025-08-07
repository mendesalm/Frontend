// src/assets/pages/harmonia/modals/PlaylistModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/modal/Modal';
import { showSuccessToast, showErrorToast } from '../../../../utils/notifications';

const PlaylistModal = ({ isOpen, onClose, playlist, onSave }) => {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (playlist) {
      setNome(playlist.nome);
    } else {
      setNome('');
    }
  }, [playlist]);

  const handleSave = () => {
    if (!nome.trim()) {
      showErrorToast('O nome da playlist não pode ser vazio.');
      return;
    }
    onSave({ ...playlist, nome });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={playlist ? 'Editar Playlist' : 'Criar Nova Playlist'}
    >
      <div className="form-group">
        <label htmlFor="playlist-nome">Nome da Playlist</label>
        <input
          id="playlist-nome"
          type="text"
          className="form-input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome da playlist"
        />
      </div>
      <div className="modal-actions">
        <button onClick={handleSave} className="btn btn-primary">
          Salvar
        </button>
        <button onClick={onClose} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

export default PlaylistModal;
