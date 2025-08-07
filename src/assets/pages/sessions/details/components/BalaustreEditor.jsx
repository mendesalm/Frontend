import React, { useEffect, useState, useRef, useCallback } from "react";
import BalaustreForm from "../../../sessions/BalaustreForm.jsx";
import FormPageLayout from "../../../../../components/layout/FormPageLayout.jsx";
import { useAuth } from "../../../../../hooks/useAuth.js";
import {
  getBalaustre,
  updateBalaustre,
  aprovarBalaustre, // Alterado de assinarBalaustre
  aprovarManualmente, // Novo
  substituirMinuta, // Novo
} from "../../../../../services/balaustreService.js";
import {
  showSuccessToast,
  showErrorToast,
} from "../../../../../utils/notifications.js";
import ConfirmationModal from "../../../../../components/modal/ConfirmationModal.jsx";

const BalaustreEditor = ({ balaustreId, refetchSession }) => {
  const { user, hasPermission } = useAuth();
  const [balaustre, setBalaustre] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "", onConfirm: null });
  const fileInputRef = useRef(null);

  const fetchBalaustreData = useCallback(async () => {
    if (!balaustreId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await getBalaustre(balaustreId);
      setBalaustre(response);
    } catch (err) {
      showErrorToast("Erro ao carregar dados do balaústre.");
    } finally {
      setIsLoading(false);
    }
  }, [balaustreId]);

  useEffect(() => {
    fetchBalaustreData();
  }, [balaustreId, fetchBalaustreData]);

  const handleAction = async (action, successMessage, errorMessage) => {
    setIsSubmitting(true);
    try {
      await action();
      showSuccessToast(successMessage);
      await fetchBalaustreData(); // Re-fetch data to reflect changes
      refetchSession(); // Refetch parent session data
    } catch (error) {
      console.error(error);
      showErrorToast(error.response?.data?.message || errorMessage);
    } finally {
      setIsSubmitting(false);
      setShowConfirmModal(false);
    }
  };

  const handleSave = (formData) => {
    handleAction(
      () => updateBalaustre(balaustreId, formData),
      "Balaústre atualizado com sucesso!",
      "Falha ao atualizar o balaústre."
    );
  };

  const handleApprove = () => {
    // Lógica para determinar o cargo. Simplificado para usar o primeiro cargo relevante.
    const userRole = user?.roles?.find(r => ["Secretário", "Orador", "Venerável Mestre"].includes(r));
    if (!userRole) {
        showErrorToast("Você não tem um cargo elegível para assinar.");
        return;
    }

    setModalContent({
        title: "Confirmar Assinatura",
        body: `Você está prestes a assinar o balaústre com o cargo de ${userRole}. Esta ação não pode ser desfeita. Deseja continuar?`,
        onConfirm: () => handleAction(
            () => aprovarBalaustre(balaustreId, userRole),
            "Balaústre assinado com sucesso!",
            "Falha ao assinar o balaústre."
        )
    });
    setShowConfirmModal(true);
  };

  const handleManualApprove = () => {
    setModalContent({
        title: "Confirmar Aprovação Manual",
        body: "Esta ação irá aprovar o balaústre imediatamente, sem as assinaturas eletrônicas. É útil caso as assinaturas tenham sido coletadas fisicamente. Deseja continuar?",
        onConfirm: () => handleAction(
            () => aprovarManualmente(balaustreId),
            "Balaústre aprovado manualmente!",
            "Falha ao aprovar o balaústre."
        )
    });
    setShowConfirmModal(true);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
        setModalContent({
            title: "Confirmar Substituição",
            body: `Tem certeza que deseja substituir a minuta atual pelo arquivo ${file.name}? A minuta antiga será perdida.`,
            onConfirm: () => handleAction(
                () => substituirMinuta(balaustreId, file),
                "Minuta do balaústre substituída com sucesso!",
                "Falha ao substituir a minuta."
            )
        });
        setShowConfirmModal(true);
    }
  };

  const handleDownload = () => {
    if (balaustre && balaustre.caminhoPdf) {
      // Forçar o download em vez de abrir em uma nova aba
      const link = document.createElement("a");
      link.href = balaustre.caminhoPdf;
      link.setAttribute("download", `Balaustre_${balaustre.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      showErrorToast("URL do PDF não encontrada.");
    }
  };

  if (isLoading) {
    return <h2>A carregar editor do balaústre...</h2>;
  }

  if (!balaustre) {
    return (
      <div className="card">
        <h3>Balaústre</h3>
        <p>Esta sessão não possui um balaústre associado ou houve um erro ao carregá-lo.</p>
      </div>
    );
  }

  const isApproved = balaustre.status === "Aprovado";
  const canEditBalaustre = hasPermission("editarBalaustre");
  const canSignBalaustre = hasPermission("assinarDocumentos");

  const ActionButtons = () => (
    <div className="session-sidebar-right">
      <h3>Ações do Balaústre</h3>
      {isApproved ? (
        <p className="text-success">Este balaústre está aprovado e não pode mais ser modificado.</p>
      ) : (
        <>
          <p>Gerencie o ciclo de vida do balaústre.</p>
          <button
            type="submit"
            form="balaustre-edit-form"
            className="btn btn-primary w-100 mb-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? "A salvar..." : "Salvar Alterações"}
          </button>
          
          {canSignBalaustre && (
            <button
              type="button"
              className="btn btn-success w-100 mb-2"
              onClick={handleApprove}
              disabled={isSubmitting}
            >
              Assinar e Avançar Aprovação
            </button>
          )}

          {canEditBalaustre && (
            <>
              <button
                type="button"
                className="btn btn-secondary w-100 mb-2"
                onClick={() => fileInputRef.current.click()}
                disabled={isSubmitting}
              >
                Substituir Minuta (PDF)
              </button>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} style={{ display: "none" }} accept=".pdf" />

              <button
                type="button"
                className="btn btn-warning w-100"
                onClick={handleManualApprove}
                disabled={isSubmitting}
              >
                Aprovação Manual (Bypass)
              </button>
            </>
          )}
        </>
      )}
    </div>
  );

  return (
    <>
      <FormPageLayout
        title="Editor de Balaústre"
        actionsComponent={<ActionButtons />}
  >
    <BalaustreForm
        formId="balaustre-edit-form"
        initialData={balaustre.dadosFormulario}
        onSave={handleSave}
        isSubmitting={isSubmitting}
        readOnly={isApproved} // Bloqueia o formulário se aprovado
        onDownload={handleDownload}
      />
      </FormPageLayout>
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={modalContent.title}
        body={modalContent.body}
        onConfirm={modalContent.onConfirm}
        isConfirming={isSubmitting}
      />
    </>
  );
};

export default BalaustreEditor;