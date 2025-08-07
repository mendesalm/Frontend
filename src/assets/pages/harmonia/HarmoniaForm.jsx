import React, { useState } from 'react';
import { createMusica } from '../../../services/harmoniaService'; // Importar o serviço
import { showSuccessToast, showErrorToast } from '../../../utils/notifications';
import '../../styles/FormStyles.css';

const HarmoniaForm = ({ onSuccess, onCancel }) => {
  const [titulo, setTitulo] = useState('');
  const [autor, setAutor] = useState('');
  const [audioFile, setAudioFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!audioFile) {
      showErrorToast('Por favor, selecione um arquivo de áudio.');
      return;
    }

    const formData = new FormData();
    // Se o título não for fornecido, usa o nome do arquivo
    formData.append('titulo', titulo.trim() || audioFile.name.replace(/\.[^/.]+$/, ''));
    formData.append('autor', autor.trim());
    formData.append('audioFile', audioFile);

    try {
      await createMusica(formData);
      showSuccessToast('Música enviada com sucesso!');
      if (onSuccess) onSuccess();
    } catch (error) {
      showErrorToast('Erro ao enviar a música.');
      console.error('Upload error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="aviso-form">
      <div className="form-group">
        <label htmlFor="titulo">Título da Música (Opcional)</label>
        <input 
          type="text" 
          id="titulo" 
          name="titulo" 
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)} 
        />
      </div>
      <div className="form-group">
        <label htmlFor="autor">Autor/Compositor (Opcional)</label>
        <input 
          type="text" 
          id="autor" 
          name="autor" 
          value={autor}
          onChange={(e) => setAutor(e.target.value)} 
        />
      </div>
      <div className="form-group">
        <label htmlFor="audioFile">Ficheiro de Áudio (MP3, WAV, etc.)</label>
        <input 
          type="file" 
          id="audioFile" 
          name="audioFile" 
          onChange={(e) => setAudioFile(e.target.files[0])} 
          accept="audio/*" 
          required 
        />
      </div>
      <div className="form-actions">
        {onCancel && <button type="button" onClick={onCancel} className="btn btn-secondary">Cancelar</button>}
        <button type="submit" className="btn btn-primary">Salvar Áudio</button>
      </div>
    </form>
  );
};

export default HarmoniaForm;

