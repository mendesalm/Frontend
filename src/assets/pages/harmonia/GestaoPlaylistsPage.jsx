import React, { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useDataFetching } from "../../../hooks/useDataFetching";
import {
  getPlaylists,
  createPlaylist,
  deletePlaylist,
  createMusica,
  deleteMusica,
  updateMusicasPlaylist, // Importar a nova função
} from "../../../services/harmoniaService";
import { showSuccessToast, showErrorToast } from "../../../utils/notifications";
import "./GestaoPlaylistsPage.css";
import "../../../assets/styles/FormStyles.css";

const ItemTypes = {
  MUSICA: "musica",
};

const MusicNoteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

// Componente para um item de música arrastável
const DraggableMusicaItem = ({ musica, index, moveMusica, onDelete }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemTypes.MUSICA,
    hover(item) {
      if (item.index !== index) {
        moveMusica(item.index, index);
        item.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.MUSICA,
    item: { id: musica.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className="musica-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span>{musica.titulo}</span>
      <button className="btn-delete-musica" onClick={() => onDelete(musica.id)}>
        Apagar
      </button>
    </div>
  );
};

const GestaoPlaylistsPage = () => {
  const {
    data: playlists,
    isLoading,
    error,
    refetch,
  } = useDataFetching(getPlaylists);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newMusicTitle, setNewMusicTitle] = useState("");
  const [newMusicAuthor, setNewMusicAuthor] = useState("");
  const [newMusicFile, setNewMusicFile] = useState(null);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim())
      return showErrorToast("O nome da playlist não pode estar vazio.");
    try {
      await createPlaylist({ nome: newPlaylistName });
      setNewPlaylistName("");
      refetch();
      showSuccessToast("Playlist criada com sucesso!");
    } catch (err) {
      showErrorToast("Erro ao criar playlist.");
    }
  };

  const handleDeletePlaylist = async (playlistId) => {
    if (
      window.confirm(
        "Tem certeza que deseja apagar esta playlist e TODAS as suas músicas? A ação não pode ser desfeita."
      )
    ) {
      try {
        await deletePlaylist(playlistId);
        if (selectedPlaylist?.id === playlistId) {
          setSelectedPlaylist(null);
        }
        refetch();
        showSuccessToast("Playlist apagada com sucesso.");
      } catch (err) {
        showErrorToast("Erro ao apagar playlist.");
      }
    }
  };

  const handleCreateMusica = async (e) => {
    e.preventDefault();
    if (!newMusicFile || !selectedPlaylist) {
      showErrorToast(
        "Selecione uma playlist e um arquivo de música para continuar."
      );
      return;
    }

    const formData = new FormData();
    formData.append("audioFile", newMusicFile);
    formData.append(
      "titulo",
      newMusicTitle.trim() || newMusicFile.name.replace(/\.[^/.]+$/, "")
    );
    formData.append("autor", newMusicAuthor.trim());
    formData.append("playlistId", selectedPlaylist.id);

    try {
      await createMusica(formData);
      setNewMusicTitle("");
      setNewMusicAuthor("");
      setNewMusicFile(null);
      document.getElementById("upload-musica-dnd").value = ""; // Limpa o input
      refetch();
      showSuccessToast("Música adicionada com sucesso!");
    } catch (err) {
      showErrorToast("Erro ao adicionar música.");
    }
  };

  const handleDeleteMusica = async (musicaId) => {
    if (window.confirm("Tem certeza que deseja apagar esta música?")) {
      try {
        await deleteMusica(musicaId);
        refetch();
        showSuccessToast("Música apagada.");
      } catch (err) {
        showErrorToast("Erro ao apagar música.");
      }
    }
  };

  const moveMusica = (fromIndex, toIndex) => {
    if (!selectedPlaylist) return;

    const updatedMusicas = [...selectedPlaylist.musicas];
    const [movedMusica] = updatedMusicas.splice(fromIndex, 1);
    updatedMusicas.splice(toIndex, 0, movedMusica);

    // Atualiza o estado local imediatamente para feedback visual
    setSelectedPlaylist((prev) => ({
      ...prev,
      musicas: updatedMusicas,
    }));
  };

  const handleDropMusica = async () => {
    if (!selectedPlaylist) return;

    const musicaIds = selectedPlaylist.musicas.map((m) => m.id);

    try {
      await updateMusicasPlaylist(selectedPlaylist.id, musicaIds);
      showSuccessToast("Ordem da playlist salva!");
      refetch(); // Garante que os dados estão sincronizados com o backend
    } catch (err) {
      showErrorToast("Erro ao salvar a ordem da playlist.");
      // Opcional: reverter a mudança visual se a API falhar
      refetch();
    }
  };

  useEffect(() => {
    if (selectedPlaylist && playlists) {
      const updatedPlaylist = playlists.find(
        (p) => p.id === selectedPlaylist.id
      );
      setSelectedPlaylist(updatedPlaylist);
    }
  }, [playlists, selectedPlaylist]);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="gestao-container">
        <div className="table-header">
          <h1>Gestão de Playlists e Músicas</h1>
        </div>
        {error && <p className="error-message">{error}</p>}

        <div className="gestao-layout">
          <div className="playlists-column">
            <h3>Playlists</h3>
            <form
              onSubmit={handleCreatePlaylist}
              className="new-playlist-form"
            >
              <input
                type="text"
                className="form-input"
                placeholder="Nome da nova playlist..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                +
              </button>
            </form>
            <div className="playlists-grid">
              {isLoading ? (
                <p>Carregando...</p>
              ) : (
                (playlists || []).map((p) => (
                  <div
                    key={p.id}
                    className={`playlist-card ${
                      selectedPlaylist?.id === p.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedPlaylist(p)}
                  >
                    <div className="playlist-card-header">
                      <span className="playlist-name">{p.nome}</span>
                      <button
                        className="btn-delete-playlist"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePlaylist(p.id);
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="playlist-card-body">
                      <MusicNoteIcon />
                      <span className="track-count">
                        {p.musicas?.length || 0} músicas
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="musicas-column">
            {selectedPlaylist ? (
              <>
                <h3>Músicas em &quot;{selectedPlaylist.nome}&quot;</h3>
                <div className="musicas-list" onMouseUp={handleDropMusica}>
                  {selectedPlaylist.musicas &&
                  selectedPlaylist.musicas.length > 0 ? (
                    selectedPlaylist.musicas.map((m, index) => (
                      <DraggableMusicaItem
                        key={m.id}
                        index={index}
                        musica={m}
                        moveMusica={moveMusica}
                        onDelete={handleDeleteMusica}
                      />
                    ))
                  ) : (
                    <p>
                      Esta playlist está vazia. Arraste músicas para cá ou use o
                      formulário abaixo.
                    </p>
                  )}
                </div>
                <form
                  className="upload-form-dnd"
                  onSubmit={handleCreateMusica}
                >
                  <input
                    type="text"
                    placeholder="Título da música (opcional)"
                    value={newMusicTitle}
                    onChange={(e) => setNewMusicTitle(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="text"
                    placeholder="Autor (opcional)"
                    value={newMusicAuthor}
                    onChange={(e) => setNewMusicAuthor(e.target.value)}
                    className="form-input"
                  />
                  <input
                    type="file"
                    id="upload-musica-dnd"
                    onChange={(e) => setNewMusicFile(e.target.files[0])}
                    accept="audio/*"
                    className="form-input"
                  />
                  <button type="submit" className="btn btn-primary">
                    Adicionar Música
                  </button>
                </form>
              </>
            ) : (
              <div className="placeholder-musicas">
                <p>
                  Selecione uma playlist à esquerda para ver e adicionar suas
                  músicas.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default GestaoPlaylistsPage;