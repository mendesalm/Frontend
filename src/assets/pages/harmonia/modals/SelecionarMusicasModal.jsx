// src/assets/pages/harmonia/modals/SelecionarMusicasModal.jsx

import React, { useState, useMemo, useRef } from 'react';
import Modal from '../../../../components/modal/Modal';
import { useDataFetching } from '../../../../hooks/useDataFetching';
import { getMusicas, addMusicToPlaylist } from '../../../../services/harmoniaService';
import { showErrorToast, showSuccessToast } from '../../../../utils/notifications';

const SelecionarMusicasModal = ({ isOpen, onClose, playlist, onMusicasAdd }) => {
  const { data: allMusicas, isLoading } = useDataFetching(getMusicas);
  const [selectedMusicas, setSelectedMusicas] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [musicaTocando, setMusicaTocando] = useState(null);
  const audioRef = useRef(new Audio());

  const musicasDisponiveis = useMemo(() => {
    if (!allMusicas || !playlist) return [];
    const musicasNaPlaylistIds = new Set(playlist.musicas.map(m => m.id));
    return allMusicas.filter(m => !musicasNaPlaylistIds.has(m.id)
      && m.titulo.toLowerCase().includes(filtro.toLowerCase()));
  }, [allMusicas, playlist, filtro]);

  const handleToggleSelect = (musicaId) => {
    setSelectedMusicas(prev => 
      prev.includes(musicaId) ? prev.filter(id => id !== musicaId) : [...prev, musicaId]
    );
  };

  const handleAddMusicas = async () => {
    if (selectedMusicas.length === 0) {
      showErrorToast("Nenhuma música selecionada.");
      return;
    }
    try {
      // Idealmente, o backend aceitaria um array de músicas para adicionar de uma vez.
      // Por enquanto, chamamos a função para cada música selecionada.
      for (const musicaId of selectedMusicas) {
        await addMusicToPlaylist(playlist.id, musicaId);
      }
      showSuccessToast(`${selectedMusicas.length} música(s) adicionada(s) com sucesso!`);
      onMusicasAdd();
      onClose();
    } catch (err) {
      showErrorToast("Falha ao adicionar músicas à playlist.");
    }
  };

  const handlePlayPreview = (musica) => {
    if (musicaTocando?.id === musica.id) {
        audioRef.current.pause();
        setMusicaTocando(null);
        return;
    }
    const audioPath = `/uploads/${musica.path}`;
    const audioSrc = audioPath;
    audioRef.current.src = audioSrc;
    audioRef.current.play().catch(() => showErrorToast("Erro ao tocar áudio."));
    setMusicaTocando(musica);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar Músicas a "${playlist?.nome}"`}>
      <input
        type="text"
        placeholder="Filtrar músicas..."
        className="form-input"
        value={filtro}
        onChange={e => setFiltro(e.target.value)}
        style={{ marginBottom: '1rem' }}
      />
      {isLoading ? <p>Carregando biblioteca...</p> : (
        <div className="musicas-list-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table className="styled-table">
            <tbody>
              {musicasDisponiveis.map(musica => (
                <tr key={musica.id}>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={selectedMusicas.includes(musica.id)}
                      onChange={() => handleToggleSelect(musica.id)}
                    />
                  </td>
                  <td>{musica.titulo}</td>
                  <td>
                    <button onClick={() => handlePlayPreview(musica)} className={`btn-action ${musicaTocando?.id === musica.id ? 'btn-stop' : 'btn-preview'}`}>
                      {musicaTocando?.id === musica.id ? 'Parar' : 'Ouvir'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="modal-actions">
        <button onClick={handleAddMusicas} className="btn btn-primary">Adicionar Selecionadas</button>
        <button onClick={onClose} className="btn btn-secondary">Cancelar</button>
      </div>
    </Modal>
  );
};

export default SelecionarMusicasModal;
