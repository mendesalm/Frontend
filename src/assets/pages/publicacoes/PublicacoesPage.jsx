import React, { useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { useDataFetching } from "../../../hooks/useDataFetching";
import {
  getPublicacoes,
  createPublicacao,
} from "../../../services/publicacaoService";
import Modal from "../../../components/modal/Modal";
import PublicacaoForm from "./PublicacaoForm";
import "./PublicacoesPage.css";
import "../../styles/TableStyles.css";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";
import logo from "../../images/ArticleIcon.png";
import { getFileUrl } from "../../../utils/fileUtils";

const PublicacoesPage = () => {
  const {
    data: publicacoes,
    isLoading,
    error: fetchError,
    refetch,
  } = useDataFetching(getPublicacoes);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  const canManage =
    user?.credencialAcesso === "Diretoria" ||
    user?.credencialAcesso === "Webmaster";

  const handleSave = async (formData) => {
    try {
      await createPublicacao(formData);
      refetch();
      setIsModalOpen(false);
      showSuccessToast("Publicação salva com sucesso!");
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Erro ao salvar a publicação."
      );
    }
  };

  const handleCardClick = (path) => {
    window.open(getFileUrl(path), "_blank", "noreferrer");
  };

  return (
    <div className="table-page-container">
      <div className="table-header">
        <h1>Publicações e Trabalhos</h1>
        {canManage && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-action btn-approve"
          >
            Nova Publicação
          </button>
        )}
      </div>

      {fetchError && <p className="error-message">{fetchError}</p>}

      <div className="publicacoes-grid">
        {isLoading ? (
          <p>A carregar publicações...</p>
        ) : publicacoes.length === 0 ? (
          <p>Nenhuma publicação ou trabalho encontrado.</p>
        ) : (
          publicacoes.map((pub) => (
            <div
              key={pub.id}
              className="publicacao-card"
              onClick={() => handleCardClick(pub.path)}
            >
              <img
                src={logo}
                alt="Publicação"
                className="publicacao-card-image"
              />
              <div className="publicacao-card-body">
                <h3>{pub.nome}</h3>
                <p>
                  <strong>Tema:</strong> {pub.tema}
                </p>
                <p>
                  <strong>Autor:</strong>{" "}
                  {pub.autorOuUploader?.NomeCompleto || "N/A"}
                </p>
                {pub.grau && (
                  <p>
                    <strong>Grau:</strong> {pub.grau}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Publicação"
      >
        <PublicacaoForm
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default PublicacoesPage;
