// src/components/forms/GenericFileForm.jsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import apiClient from "../../services/apiClient";
import { getFileUrl } from "../../utils/fileUtils";
import "../../assets/styles/FormStyles.css";

const GenericFileForm = ({
  itemToEdit,
  onSave,
  onCancel,
  validationSchema,
}) => {
  const isEditing = !!itemToEdit;
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(validationSchema(isEditing)),
  });

  const [selectedFileName, setSelectedFileName] = useState(null);

  const fileField = watch("documento");

  useEffect(() => {
    if (fileField && fileField.length > 0) {
      setSelectedFileName(fileField[0].name);
    } else {
      setSelectedFileName(null);
    }
  }, [fileField]);

  useEffect(() => {
    if (itemToEdit) {
      reset({
        ...itemToEdit,
        dataPublicacao: itemToEdit.dataPublicacao
          ? new Date(itemToEdit.dataPublicacao).toISOString().split("T")[0]
          : "",
      });
    } else {
      reset({
        titulo: "",
        descricao: "",
        dataPublicacao: new Date().toISOString().split("T")[0],
        documento: null,
      });
    }
  }, [itemToEdit, reset]);

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("titulo", data.titulo);
    formData.append("descricao", data.descricao);

    // CORREÇÃO: Formata o objeto Date para uma string 'AAAA-MM-DD'
    const date = new Date(data.dataPublicacao);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + timezoneOffset);
    const formattedDate = adjustedDate.toISOString().split("T")[0];
    formData.append("dataPublicacao", formattedDate);

    if (data.documento && data.documento[0]) {
      formData.append("documento", data.documento[0]);
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <div className="form-group">
        <label htmlFor="titulo">Título</label>
        <input
          id="titulo"
          type="text"
          {...register("titulo")}
          className={`form-input ${errors.titulo ? "is-invalid" : ""}`}
        />
        {errors.titulo && (
          <p className="form-error-message">{errors.titulo.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Descrição (Opcional)</label>
        <textarea
          id="descricao"
          rows="3"
          {...register("descricao")}
          className="form-textarea"
        />
      </div>

      <div className="form-group">
        <label htmlFor="dataPublicacao">Data de Publicação</label>
        <input
          id="dataPublicacao"
          type="date"
          {...register("dataPublicacao")}
          className={`form-input ${errors.dataPublicacao ? "is-invalid" : ""}`}
        />
        {errors.dataPublicacao && (
          <p className="form-error-message">{errors.dataPublicacao.message}</p>
        )}
      </div>

      {isEditing && itemToEdit?.caminhoArquivo && (
        <div className="form-group">
          <label>Ficheiro Atual</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              background: "#2c3e50",
              padding: "10px",
              borderRadius: "6px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontStyle: "italic",
                color: "#ecf0f1",
                flexGrow: 1,
              }}
            >
              {itemToEdit.nomeOriginalArquivo}
            </p>
            <a
              href={getFileUrl(itemToEdit.caminhoArquivo)}
              target="_blank"
              rel="noreferrer"
              className="btn btn-secondary"
              style={{
                padding: "8px 12px",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Ver / Baixar
            </a>
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="documento-upload">
          {isEditing ? "Substituir Ficheiro (Opcional)" : "Ficheiro"}
        </label>
        <label
          htmlFor="documento"
          className="custom-file-upload-label btn btn-secondary"
        >
          Selecionar Ficheiro
        </label>
        <input
          id="documento"
          type="file"
          {...register("documento")}
          className="visually-hidden"
        />
        {selectedFileName && (
          <span className="file-name-display">{selectedFileName}</span>
        )}
        {errors.documento && (
          <p className="form-error-message">{errors.documento.message}</p>
        )}
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn btn-secondary">
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? "A guardar..." : isEditing ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default GenericFileForm;
