import React, { useState } from 'react';
import Modal from './Modal';
import '../../assets/styles/FormStyles.css'; // Reutilizar estilos de formulário
import './AddMusicModal.css';

const AddMusicModal = ({ isOpen, onClose, playlistId, onCreateMusica }) => {
  const [newMusicTitle, setNewMusicTitle] = useState('');
  const [newMusicAuthor, setNewMusicAuthor] = useState('');
  const [newMusicFile, setNewMusicFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMusicFile || !playlistId) {
      alert('Selecione uma playlist e um arquivo de música para continuar.'); // Usar toast no futuro
      return;
    }

    // Chamar a função de criação de música passada pelo pai
    await onCreateMusica(newMusicTitle, newMusicAuthor, newMusicFile, playlistId);

    // Limpar o formulário e fechar o modal
    setNewMusicTitle('');
    setNewMusicAuthor('');
    setNewMusicFile(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Nova Música">
      <form onSubmit={handleSubmit} className="add-music-form">
        <div className="form-group">
          <label htmlFor="musicTitle">Título da Música (opcional):</label>
          <input
            type="text"
            id="musicTitle"
            className="form-input"
            value={newMusicTitle}
            onChange={(e) => setNewMusicTitle(e.target.value)}
            placeholder="Título da música"
          />
        </div>
        <div className="form-group">
          <label htmlFor="musicAuthor">Autor (opcional):</label>
          <input
            type="text"
            id="musicAuthor"
            className="form-input"
            value={newMusicAuthor}
            onChange={(e) => setNewMusicAuthor(e.target.value)}
            placeholder="Autor da música"
          />
        </div>
        <div className="form-group">
          <label htmlFor="musicFile">Arquivo de Música:</label>
          <input
            type="file"
            id="musicFile"
            className="form-input"
            onChange={(e) => setNewMusicFile(e.target.files[0])}
            accept="audio/*"
            required
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Adicionar Música
          </button>
          <button type="button" onClick={onClose} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMusicModal;