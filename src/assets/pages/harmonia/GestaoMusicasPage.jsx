// src/assets/pages/harmonia/GestaoMusicasPage.jsx (NOVO)

import React, { useState, useRef } from "react";
import { useDataFetching } from "../../../hooks/useDataFetching";
import {
  getMusicas,
  deleteMusica,
  updateMusica,
} from "../../../services/harmoniaService";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";
import Modal from "../../../components/modal/Modal";
import HarmoniaForm from "./HarmoniaForm"; // Reutilizando o formulário de upload
import "./GestaoMusicasPage.css"; // Novo CSS
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
  const [currentMusica, setCurrentMusica] = useState(null);
  const [newTitulo, setNewTitulo] = useState("");

  const audioRef = useRef(new Audio());

  const handlePlayPreview = (musica) => {
    const baseURL = apiClient.defaults.baseURL.startsWith("http")
      ? apiClient.defaults.baseURL
      : window.location.origin;
    const finalPath = `${baseURL}/${musica.path}`.replace(/([^:]\/)\/+/g, "$1");

    const audio = audioRef.current;
    audio.src = finalPath;
    audio.play().catch(() => showErrorToast("Erro ao tocar áudio."));
  };

  const handleDelete = async (musicaId) => {
    if (
      window.confirm(
        "Tem certeza que deseja excluir esta música? A ação não pode ser desfeita."
      )
    ) {
      try {
        await deleteMusica(musicaId);
        showSuccessToast("Música excluída com sucesso!");
        refetch();
      } catch (err) {
        showErrorToast("Falha ao excluir a música.");
        console.error(err);
      }
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

  if (isLoading) return <p>Carregando músicas...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="gestao-musicas-container">
      <div className="header-container">
        <h1>Gestão de Músicas</h1>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary"
        >
          Upload Nova Música
        </button>
      </div>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {(musicas || []).map((musica) => (
            <tr key={musica.id}>
              <td>{musica.titulo}</td>
              <td className="actions-cell">
                <button
                  onClick={() => handlePlayPreview(musica)}
                  className="btn-action btn-preview"
                >
                  Ouvir
                </button>
                <button
                  onClick={() => openEditModal(musica)}
                  className="btn-action btn-edit"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(musica.id)}
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
        title="Upload de Nova Música"
      >
        <HarmoniaForm
          onSuccess={() => {
            setIsUploadModalOpen(false);
            refetch();
          }}
          onCancel={() => setIsUploadModalOpen(false)} // Adicionado
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
    </div>
  );
};

export default GestaoMusicasPage;
