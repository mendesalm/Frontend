// src/assets/pages/harmonia/modals/TipoSessaoModal.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../../../../components/modal/Modal';
import { showSuccessToast, showErrorToast } from '../../../../utils/notifications';

const TipoSessaoModal = ({ isOpen, onClose, tipoSessao, onSave }) => {
  const [nome, setNome] = useState('');

  useEffect(() => {
    if (tipoSessao) {
      setNome(tipoSessao.nome);
    } else {
      setNome('');
    }
  }, [tipoSessao]);

  const handleSave = () => {
    if (!nome.trim()) {
      showErrorToast('O nome do Tipo de Sessão não pode ser vazio.');
      return;
    }
    onSave({ ...tipoSessao, nome });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tipoSessao ? 'Editar Tipo de Sessão' : 'Criar Novo Tipo de Sessão'}
    >
      <div className="form-group">
        <label htmlFor="tipoSessao-nome">Nome do Tipo de Sessão</label>
        <input
          id="tipoSessao-nome"
          type="text"
          className="form-input"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome do tipo de sessão"
        />
      </div>
      <div className="modal-actions">
        <button onClick={handleSave} className="btn btn-primary">
          Salvar
        </button>
        <button onClick={onClose} className="btn btn-secondary">
          Cancelar
        </button>
      </div>
    </Modal>
  );
};

export default TipoSessaoModal;
