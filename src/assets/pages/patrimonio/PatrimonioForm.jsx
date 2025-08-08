import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { patrimonioValidationSchema } from "../../../validators/patrimonioValidator";
import "../../../assets/styles/FormStyles.css";

const PatrimonioForm = ({ itemToEdit, onSave, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(patrimonioValidationSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      dataAquisicao: "",
      valorAquisicao: "",
      quantidade: 1,
      estadoConservacao: "Bom",
      localizacao: "",
    },
  });

  useEffect(() => {
    if (itemToEdit) {
      // Formata os dados para preencher o formulário corretamente
      reset({
        ...itemToEdit,
        dataAquisicao: itemToEdit.dataAquisicao
          ? new Date(itemToEdit.dataAquisicao).toISOString().split("T")[0]
          : "",
      });
    } else {
      reset(); // Limpa para um novo item
    }
  }, [itemToEdit, reset]);

  // A função onSave (passada como prop) será chamada apenas se a validação for bem-sucedida.
  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="form-container">
      <div className="form-group">
        <label htmlFor="nome">Nome do Item</label>
        <input
          id="nome"
          type="text"
          {...register("nome")}
          className={`form-input ${errors.nome ? "is-invalid" : ""}`}
        />
        {errors.nome && (
          <p className="form-error-message">{errors.nome.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          rows="4"
          {...register("descricao")}
          className={`form-textarea ${errors.descricao ? "is-invalid" : ""}`}
        />
        {errors.descricao && (
          <p className="form-error-message">{errors.descricao.message}</p>
        )}
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="dataAquisicao">Data de Aquisição</label>
          <input
            id="dataAquisicao"
            type="date"
            {...register("dataAquisicao")}
            className={`form-input ${errors.dataAquisicao ? "is-invalid" : ""}`}
          />
          {errors.dataAquisicao && (
            <p className="form-error-message">{errors.dataAquisicao.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="valorAquisicao">Valor de Aquisição (R$)</label>
          <input
            id="valorAquisicao"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("valorAquisicao")}
            className={`form-input ${
              errors.valorAquisicao ? "is-invalid" : ""
            }`}
          />
          {errors.valorAquisicao && (
            <p className="form-error-message">
              {errors.valorAquisicao.message}
            </p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="quantidade">Quantidade</label>
          <input
            id="quantidade"
            type="number"
            {...register("quantidade")}
            className={`form-input ${errors.quantidade ? "is-invalid" : ""}`}
          />
          {errors.quantidade && (
            <p className="form-error-message">{errors.quantidade.message}</p>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="estadoConservacao">Estado de Conservação</label>
          <select
            id="estadoConservacao"
            {...register("estadoConservacao")}
            className={`form-select ${
              errors.estadoConservacao ? "is-invalid" : ""
            }`}
          >
            <option value="Novo">Novo</option>
            <option value="Bom">Bom</option>
            <option value="Regular">Regular</option>
            <option value="Inservível">Inservível</option>
          </select>
          {errors.estadoConservacao && (
            <p className="form-error-message">
              {errors.estadoConservacao.message}
            </p>
          )}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="patrimonioLocalizacao">Localização</label>
        <textarea
          id="patrimonioLocalizacao"
          rows="3"
          {...register("localizacao")}
          className={`form-textarea ${errors.localizacao ? "is-invalid" : ""}`}
        />
        {errors.localizacao && (
          <p className="form-error-message">{errors.localizacao.message}</p>
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
          {isSubmitting ? "A salvar..." : "Salvar Item"}
        </button>
      </div>
    </form>
  );
};

export default PatrimonioForm;
