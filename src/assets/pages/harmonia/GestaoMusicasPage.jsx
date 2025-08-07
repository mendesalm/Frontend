// src/assets/pages/harmonia/GestaoMusicasPage.jsx (Refatorado para Biblioteca de Músicas)

import React, { useState, useRef, useMemo } from "react";
import { useDataFetching } from "../../../hooks/useDataFetching";
import {
  getMusicas,
  deleteMusica,
  updateMusica,
} from "../../../services/harmoniaService";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";
import Modal from "../../../components/modal/Modal";
import ConfirmationModal from "../../../components/modal/ConfirmationModal";
import HarmoniaForm from "./HarmoniaForm";
import "./GestaoMusicasPage.css";
import apiClient from "../../../services/apiClient";

const GestaoMusicasPage = () => {
  const {
    data: musicas,
    isLoading,
    error,
    refetch,
  } = useDataFetching(getMusicas);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentMusica, setCurrentMusica] = useState(null);
  const [newTitulo, setNewTitulo] = useState("");
  const [filtro, setFiltro] = useState("");
  
  const [musicaTocando, setMusicaTocando] = useState(null);
  const audioRef = useRef(new Audio());

  // Lógica do Player de Áudio
  const handlePlayPreview = (musica) => {
    if (musicaTocando?.id === musica.id) {
      handleStopPreview();
      return;
    }

    const audioPath = `/uploads/${musica.path}`;
    const audioSrc =
      import.meta.env.MODE === "production"
        ? `${import.meta.env.VITE_BACKEND_URL}${audioPath}`
        : audioPath;

    const audio = audioRef.current;
    audio.src = audioSrc;
    audio.play().catch((e) => {
      console.error("Erro ao tocar áudio:", e);
      showErrorToast("Formato de áudio não suportado.");
    });
    setMusicaTocando(musica);
  };

  const handleStopPreview = () => {
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setMusicaTocando(null);
  };

  // Lógica de CRUD
  const handleDeleteRequest = (musica) => {
    setCurrentMusica(musica);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentMusica) return;
    try {
      await deleteMusica(currentMusica.id);
      showSuccessToast("Música excluída com sucesso!");
      refetch();
      setIsDeleteModalOpen(false);
      setCurrentMusica(null);
    } catch (err) {
      showErrorToast("Falha ao excluir a música.");
      console.error(err);
    }
  };

  const openEditModal = (musica) => {
    setCurrentMusica(musica);
    setNewTitulo(musica.titulo);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!currentMusica || !newTitulo.trim()) {
      showErrorToast("O título não pode ser vazio.");
      return;
    }
    try {
      await updateMusica(currentMusica.id, { titulo: newTitulo });
      showSuccessToast("Música atualizada com sucesso!");
      refetch();
      setIsEditModalOpen(false);
      setCurrentMusica(null);
    } catch (err) {
      showErrorToast("Falha ao atualizar a música.");
      console.error(err);
    }
  };

  const musicasFiltradas = useMemo(() => {
    if (!musicas) return [];
    return musicas.filter((musica) =>
      musica.titulo.toLowerCase().includes(filtro.toLowerCase())
    );
  }, [musicas, filtro]);

  if (isLoading) return <p>Carregando biblioteca de músicas...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="gestao-musicas-container">
      <div className="header-container">
        <h1>Biblioteca de Músicas</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary"
        >
          Upload Nova Música
        </button>
      </div>

      <div className="filtro-container">
        <input
          type="text"
          placeholder="Filtrar por título..."
          className="form-input"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {musicasFiltradas.map((musica) => (
            <tr key={musica.id}>
              <td>{musica.titulo}</td>
              <td className="actions-cell">
                <button
                  onClick={() => handlePlayPreview(musica)}
                  className={`btn-action ${musicaTocando?.id === musica.id ? 'btn-stop' : 'btn-preview'}`}
                >
                  {musicaTocando?.id === musica.id ? "Parar" : "Ouvir"}
                </button>
                <button
                  onClick={() => openEditModal(musica)}
                  className="btn-action btn-edit"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeleteRequest(musica)}
                  className="btn-action btn-delete"
                >
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal de Upload */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload de Nova Música para a Biblioteca"
      >
        <HarmoniaForm
          onSuccess={() => {
            setIsUploadModalOpen(false);
            refetch();
          }}
          onCancel={() => setIsUploadModalOpen(false)}
        />
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Editar Título da Música"
      >
        <div className="form-group">
          <label htmlFor="musica-titulo">Título</label>
          <input
            id="musica-titulo"
            type="text"
            className="form-input"
            value={newTitulo}
            onChange={(e) => setNewTitulo(e.target.value)}
          />
        </div>
        <button onClick={handleUpdate} className="btn btn-primary">
          Salvar Alterações
        </button>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmar Exclusão Permanente"
        message="Atenção: Esta ação apagará permanentemente o arquivo de música do sistema. Ele será removido de TODAS as playlists em que aparece. Deseja continuar?"
      />
    </div>
  );
};

export default GestaoMusicasPage;
