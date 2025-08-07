// src/assets/pages/harmonia/modals/MusicasModal.jsx

import React from 'react';
import Modal from '../../../../components/modal/Modal';
import { showErrorToast, showSuccessToast } from '../../../../utils/notifications';
import { removeMusicFromPlaylist } from '../../../../services/harmoniaService';

const MusicasModal = ({ isOpen, onClose, playlist, onMusicRemoved }) => {

  const handleRemoveMusic = async (musicaId) => {
    if (!playlist) return;

    if (window.confirm("Tem certeza que deseja remover esta música da playlist?")) {
      try {
        await removeMusicFromPlaylist(playlist.id, musicaId);
        showSuccessToast("Música removida com sucesso!");
        onMusicRemoved(); // Callback para atualizar a lista de playlists
      } catch (err) {
        showErrorToast("Falha ao remover a música.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Músicas em "${playlist?.nome}"`}
    >
      {playlist?.musicas && playlist.musicas.length > 0 ? (
        <table className="styled-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {playlist.musicas.map((musica) => (
              <tr key={musica.id}>
                <td>{musica.titulo}</td>
                <td className="actions-cell">
                  <button 
                    onClick={() => handleRemoveMusic(musica.id)} 
                    className="btn-action btn-delete"
                  >
                    Remover
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Esta playlist ainda não tem músicas.</p>
      )}
    </Modal>
  );
};

export default MusicasModal;
