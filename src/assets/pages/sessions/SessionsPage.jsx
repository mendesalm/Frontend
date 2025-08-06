import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { useDataFetching } from "~/hooks/useDataFetching";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "~/services/sessionService";
import { createAviso, getAllAvisos, deleteAviso } from "~/services/avisoService";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importar moment-timezone
import { formatDateForInput, formatFullDate } from "~/utils/dateUtils";
import { showSuccessToast, showErrorToast } from "~/utils/notifications";
import Modal from "~/components/modal/Modal";
import SessionForm from "./SessionForm";
import { getFileUrl } from "../../../utils/fileUtils";

import "./SessionsPage.css";

// --- Subcomponente: Card de Destaque ---
const HighlightedSession = ({ session, onEdit, onDelete, handleViewDocument }) => {
  if (!session) {
    return (
      <div className="highlight-card">
        <h2>Nenhuma sessão futura agendada.</h2>
        <p>Crie uma nova sessão para começar.</p>
      </div>
    );
  }
  return (
    <div className="highlight-card">
      <div className="highlight-header">
        <span>Próxima Sessão</span>
        <h2>{`${session.tipoSessao} - ${session.subtipoSessao}`}</h2>
      </div>
      <div className="highlight-body">
        <p className="highlight-date">{format(new Date(session.dataSessao), "EEEE, dd 'de' MMMM 'de' yyyy, 'às' HH:mm'h'", { locale: ptBR })}</p>
        <p className="highlight-status">Status: {new Date(session.dataSessao) < new Date() && session.status === 'Agendada' ? 'Realizada' : session.status}</p>
      </div>
      <div className="highlight-footer">
        <Link to={`/sessoes/${session.id}`} className="btn-details">
          Ver Detalhes
        </Link>
        {session.ataUrl && (
          <button
            onClick={() => handleViewDocument(session.ataUrl)}
            className="btn-action-light btn-view"
          >
            <FontAwesomeIcon icon={faEye} /> Ver Ata
          </button>
        )}
        {session.balaustre?.status === 'Aprovado' && session.balaustre?.caminhoPdfLocal && (
          <button
            onClick={() => handleViewDocument(session.balaustre.caminhoPdfLocal)}
            className="btn-action-light btn-view"
          >
            <FontAwesomeIcon icon={faEye} /> Ver Balaústre
          </button>
        )}
        {session.edital?.caminhoPdfLocal && (
          <button
            onClick={() => handleViewDocument(session.edital.caminhoPdfLocal)}
            className="btn-action-light btn-view"
          >
            <FontAwesomeIcon icon={faEye} /> Ver Edital
          </button>
        )}
        {session.convite?.caminhoPdfLocal && (
          <button
            onClick={() => handleViewDocument(session.convite.caminhoPdfLocal)}
            className="btn-action-light btn-view"
          >
            <FontAwesomeIcon icon={faEye} /> Ver Convite
          </button>
        )}
        <button onClick={() => onEdit(session)} className="btn-action-light">
          Editar
        </button>
        <button
          onClick={() => onDelete(session.id)}
          className="btn-action-light-danger"
        >
          Deletar
        </button>
      </div>
    </div>
  );
};

// --- Subcomponente: Item da Lista de Próximas Sessões ---
const SessionListItem = ({ session, onEdit, onDelete }) => (
  <li className="session-list-item">
    <div className="list-item-info">
      <span className="list-item-date">
        {format(new Date(session.dataSessao), "dd/MM/yyyy")}
      </span>
      <span className="list-item-type">{`${session.tipoSessao} - ${session.subtipoSessao}`}</span>
    </div>
    <div className="list-item-actions">
      <Link to={`/sessoes/${session.id}`} className="btn-details-small">
        Detalhes
      </Link>
      <button
        onClick={() => onEdit(session)}
        className="btn-action-small btn-edit"
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(session.id)}
        className="btn-action-small btn-delete"
      >
        Deletar
      </button>
    </div>
  </li>
);

// --- Subcomponente: Tabela de Histórico ---
const PastSessionsTable = ({
  sessions,
  onEdit,
  onDelete,
  handleViewDocument,
}) => {
  console.log("[PastSessionsTable] Sessions data:", sessions);
  return (
    <div className="table-responsive">
      <table className="custom-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Tipo</th>
            <th>Status</th>
            <th>Balaústre</th>
            <th>Edital</th>
            <th>Convite</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((session) => (
            <tr key={session.id}>
              <td>{format(new Date(session.dataSessao), "dd/MM/yyyy")}</td>
              <td>{`${session.tipoSessao} - ${session.subtipoSessao}`}</td>
              <td>
                <span
                  className={`status-badge status-${(new Date(session.dataSessao) < new Date() && session.status === 'Agendada' ? 'Realizada' : session.status)?.toLowerCase()}`}
                >
                  {new Date(session.dataSessao) < new Date() && session.status === 'Agendada' ? 'Realizada' : session.status}
                </span>
              </td>
              <td>
                {session.balaustre?.status === 'Aprovado' && session.balaustre?.caminhoPdfLocal ? (
                  <button
                    onClick={() =>
                      handleViewDocument(session.balaustre.caminhoPdfLocal)
                    }
                    className="btn-action-small btn-view"
                  >
                    <FontAwesomeIcon icon={faEye} /> Ver Balaústre
                  </button>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                {session.edital?.caminhoPdfLocal ? (
                  <button
                    onClick={() =>
                      handleViewDocument(session.edital.caminhoPdfLocal)
                    }
                    className="btn-action-small btn-view"
                  >
                    <FontAwesomeIcon icon={faEye} /> Ver Edital
                  </button>
                ) : (
                  "N/A"
                )}
              </td>
              <td>
                {session.convite?.caminhoPdfLocal ? (
                  <button
                    onClick={() =>
                      handleViewDocument(session.convite.caminhoPdfLocal)
                    }
                    className="btn-action-small btn-view"
                  >
                    <FontAwesomeIcon icon={faEye} /> Ver Convite
                  </button>
                ) : (
                  "N/A"
                )}
              </td>
              <td className="actions-cell">
                <Link
                  to={`/sessoes/${session.id}`}
                  className="btn-action btn-primary"
                >
                  Detalhes
                </Link>
                <button
                  onClick={() => onEdit(session)}
                  className="btn-action btn-edit"
                >
                  Editar
                </button>
                <button
                  onClick={() => onDelete(session.id)}
                  className="btn-action btn-delete"
                >
                  Deletar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// --- Componente Principal ---
const SessionsPage = () => {
  const [activeTab, setActiveTab] = useState("future");
  const [filterDate, setFilterDate] = useState(formatDateForInput(new Date()));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [hasPerformedInitialStatusUpdate, setHasPerformedInitialStatusUpdate] = useState(false);

  const {
    data: futureSessionsDataRaw,
    isLoading: isLoadingFuture,
    refetch: refetchFuture,
  } = useDataFetching(getSessions, [
    { sortBy: "dataSessao", order: "ASC" },
  ]);

  const {
    data: pastSessionsRaw,
    isLoading: isLoadingPast,
    refetch: fetchPastSessions,
  } = useDataFetching(getSessions, [{}], false); // Disable initial fetch

  const futureSessions = useMemo(() => {
    const now = new Date();
    return (futureSessionsDataRaw || []).filter(session => 
      new Date(session.dataSessao) >= now && session.status === 'Agendada'
    ).sort((a, b) => new Date(a.dataSessao) - new Date(b.dataSessao));
  }, [futureSessionsDataRaw]);

  const pastSessions = useMemo(() => {
    const now = new Date();
    return (pastSessionsRaw || []).filter(session => 
      new Date(session.dataSessao) < now && session.status === 'Realizada'
    ).sort((a, b) => new Date(b.dataSessao) - new Date(a.dataSessao));
  }, [pastSessionsRaw]);

  useEffect(() => {
    if (activeTab === 'past') {
      handleSearchPastSessions();
    }
  }, [activeTab]);

  const highlightedSession = futureSessions?.[0];
  const futureSessionsList = (futureSessions || []).filter(
    (s) => s.id !== highlightedSession?.id
  );

  const handleSearchPastSessions = () => {
    const endDate = new Date(filterDate);
    endDate.setHours(23, 59, 59, 999);
    fetchPastSessions([
      {
        endDate: endDate.toISOString(),
        limit: 10,
        sortBy: "dataSessao",
        order: "DESC",
      },
    ]);
  };

  const openModal = (session = null) => {
    setCurrentSession(session);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setCurrentSession(null);
    setIsModalOpen(false);
  };

  const handleSave = async (formData) => {
    const data = new FormData();
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });

    try {
      if (currentSession) {
        await updateSession(currentSession.id, data);
        showSuccessToast("Sessão atualizada com sucesso!");
      } else {
        const newSessionResponse = await createSession(data);
        console.log("Resposta da criação da sessão (newSessionResponse.data):", newSessionResponse.data);
        showSuccessToast("Sessão criada com sucesso!");

        // Cria um aviso no dashboard, independentemente do checkbox de e-mail
        if (newSessionResponse.data) { // Garante que a sessão foi criada com sucesso
          const newSession = newSessionResponse.data;
          const avisoData = {
            titulo: `Nova Sessão Agendada: ${newSession.tipoSessao} de ${newSession.subtipoSessao}`,
            conteudo: `Uma nova sessão foi agendada para ${formatFullDate(newSession.dataSessao)}. Confira os detalhes, edital e convite.`,
            link: `/sessoes/${newSession.id}`,
            dataExpiracao: new Date(newSession.dataSessao).toISOString(), // Envia a data completa como ISO 8601
            fixado: false, // Adicionado explicitamente
            documentos: { // Reintroduzindo o objeto documentos
              editalUrl: newSession.caminhoEditalPdf || null,
              conviteUrl: newSession.caminhoConvitePdf || null,
            },
          };
          console.log("Payload do aviso (avisoData):", avisoData);
          try {
            await createAviso(avisoData);
            showSuccessToast("Aviso de nova sessão criado com sucesso!");
          } catch (avisoErr) {
            showErrorToast("Erro ao criar aviso de nova sessão.");
            console.error("Erro ao criar aviso:", avisoErr);
          }
        }
      }
      closeModal();
      refetchFuture();
      if (pastSessions && pastSessions.length > 0) {
        handleSearchPastSessions();
      }
    } catch (err) {
      showErrorToast(
        err.response?.data?.message || "Erro ao guardar a sessão."
      );
    }
  };

  const handleDelete = async (sessionId) => {
    if (
      window.confirm(
        "Tem a certeza que deseja apagar esta sessão? Esta ação é irreversível."
      )
    ) {
      try {
        await deleteSession(sessionId);
        showSuccessToast("Sessão apagada com sucesso!");

        // Lógica para apagar o aviso correspondente
        const avisoLink = `/sessoes/${sessionId}`;
        const avisosResponse = await getAllAvisos({ link: avisoLink }); // Buscar avisos pelo link
        if (avisosResponse.data && avisosResponse.data.length > 0) {
          const avisoToDelete = avisosResponse.data[0]; // Pega o primeiro aviso encontrado
          try {
            await deleteAviso(avisoToDelete.id);
            showSuccessToast("Aviso correspondente apagado com sucesso!");
          } catch (avisoDeleteErr) {
            showErrorToast("Erro ao apagar aviso correspondente.");
            console.error("Erro ao apagar aviso:", avisoDeleteErr);
          }
        }
        refetchFuture();
        if (pastSessions && pastSessions.length > 0) {
          handleSearchPastSessions();
        }
      } catch (err) {
        showErrorToast(
          err.response?.data?.message || "Não foi possível apagar a sessão."
        );
      }
    }
  };

  const handleViewDocument = (relativePath) => {
    if (relativePath) {
      window.open(getFileUrl(relativePath), "_blank");
    } else {
      showErrorToast("Documento não disponível.");
    }
  };

  return (
    <div className="sessions-page-container">
      <div className="table-header">
        <h1>Gestão de Sessões</h1>
      </div>

      {isLoadingFuture ? (
        <p>A carregar sessões...</p>
      ) : (
        <HighlightedSession
          session={highlightedSession}
          onEdit={openModal}
          onDelete={handleDelete}
          handleViewDocument={handleViewDocument}
        />
      )}

      <div className="sessions-list-container">
        <div className="tabs">
          <button
            onClick={() => setActiveTab("future")}
            className={activeTab === "future" ? "active" : ""}
          >
            Próximas Sessões
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={activeTab === "past" ? "active" : ""}
          >
            Histórico de Sessões
          </button>
        </div>

        {activeTab === "future" && (
          <div className="tab-content">
            {isLoadingFuture ? (
              <p>A carregar...</p>
            ) : futureSessionsList.length > 0 ? (
              <ul className="session-list">
                {futureSessionsList.map((session) => (
                  <SessionListItem
                    key={session.id}
                    session={session}
                    onEdit={openModal}
                    onDelete={handleDelete}
                  />
                ))}
              </ul>
            ) : (
              <p>Nenhuma outra sessão futura agendada.</p>
            )}
          </div>
        )}

        {activeTab === "past" && (
          <div className="tab-content">
            <div className="filter-bar">
              <input
                type="date"
                className="form-input"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
              <button
                className="btn-action"
                onClick={handleSearchPastSessions}
                disabled={isLoadingPast}
              >
                {isLoadingPast ? "A buscar..." : "Buscar"}
              </button>
            </div>
            {isLoadingPast ? (
              <p>A buscar histórico...</p>
            ) : pastSessions ? (
              pastSessions.length > 0 ? (
                <PastSessionsTable
                  sessions={pastSessions}
                  onEdit={openModal}
                  onDelete={handleDelete}
                  handleViewDocument={handleViewDocument}
                />
              ) : (
                <p>Nenhuma sessão encontrada para a data selecionada.</p>
              )
            ) : (
              <p>Use o filtro acima para buscar sessões passadas.</p>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={currentSession ? "Editar Sessão" : "Criar Nova Sessão"}
      >
        <SessionForm
          sessionToEdit={currentSession}
          onSave={handleSave}
          onCancel={closeModal}
        />
      </Modal>

      <button
        onClick={() => openModal()}
        className="btn-fab"
        title="Criar Nova Sessão"
      >
        +
      </button>
    </div>
  );
};

export default SessionsPage;
