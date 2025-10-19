import { useState, useEffect } from "react";
import SmartphoneList from "./SmartphoneList.jsx";
import AjouterSmartphone from "./AjouterSmartphone.jsx";
import DetaillerSmartphone from "./DetaillerSmartphone.jsx";
import EditerSmartphone from "./EditerSmartphone.jsx";

// URL de l'API - s'adapte selon l'environnement
const API_BASE = import.meta.env.VITE_API_URL || "http://backend.local/api/smartphones";





function Classe() {
  const [smartphones, setSmartphones] = useState([]);
  const [section, setSection] = useState("list");
  const [selectedPhone, setSelectedPhone] = useState(null);
  const [editingPhone, setEditingPhone] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction améliorée pour charger les smartphones
  const getSmartphones = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Tentative de connexion à:", API_BASE);
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP! statut: ${response.status}`);
      }

      const data = await response.json();
      setSmartphones(data);
    } catch (err) {
      console.error("Erreur détaillée:", err);
      setError(`Impossible de charger les smartphones: ${err.message}`);
      setSmartphones([]); // Reset en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  // Charger au démarrage
  useEffect(() => {
    getSmartphones();
  }, []);

  // Ajouter smartphone avec gestion d'erreur améliorée
  const ajouterSmartphone = async (phone) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(phone),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur serveur: ${response.status} - ${errorText}`);
      }

      await getSmartphones(); // Recharge la liste
      setSection("list");
    } catch (err) {
      console.error("Erreur ajout:", err);
      setError(`Erreur lors de l'ajout: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer smartphone
  const supprimer = async (id) => {
    const code = prompt("Entrez le code de suppression :");
    if (!code) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers: {
          "x-delete-code": code,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(`Erreur : ${error.message}`);
        return;
      }

      await getSmartphones();
    } catch (err) {
      console.error(err);
      setError(`Erreur suppression: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Voir détail
  const voirDetail = async (phone) => {
    try {
      const response = await fetch(`${API_BASE}/${phone.id}`);
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      const data = await response.json();
      setSelectedPhone(data);
      setSection("detail");
    } catch (err) {
      console.error(err);
      setError(`Erreur détail: ${err.message}`);
    }
  };

  // Préparer édition
  const editPhone = (phone) => {
    setEditingPhone(phone);
    setSection("edit");
  };

  // Sauvegarder édition
  const sauvegarderEdition = async (updatedPhone) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/${updatedPhone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPhone),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      await getSmartphones();
      setSection("list");
      setEditingPhone(null);
    } catch (err) {
      console.error(err);
      setError(`Erreur édition: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Liste filtrée
  const filteredSmartphones = smartphones.filter((p) => {
    const nom = p.nom || "";
    const marque = p.marque || "";
    return (
      nom.toLowerCase().includes(search.toLowerCase()) ||
      marque.toLowerCase().includes(search.toLowerCase())
    );
  });

  // Fonction pour réessayer la connexion
  const retryConnection = () => {
    setError(null);
    getSmartphones();
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <div className="flex items-center justify-between bg-gray-800 text-white p-4 shadow-lg">
        <div className="flex items-center gap-4">
          <img
            src="/images/logo.jpeg"
            alt="Logo"
            className="w-16 h-16 rounded-full object-cover border-2 border-white"
          />
          <h1 className="text-2xl font-bold">Gestion Smartphones</h1>
        </div>

        {/* Barre de recherche */}
        <input
          type="text"
          placeholder="Rechercher par nom ou marque..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-lg text-gray-800 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Bouton ajouter */}
        <button
          onClick={() => setSection("add")}
          className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-lg font-semibold transition duration-200"
        >
          Ajouter smartphone
        </button>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded mx-4 mt-4">
          <div className="flex justify-between items-center">
            <div>
              <strong>Erreur de connexion:</strong> {error}
            </div>
            <button 
              onClick={retryConnection}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-200"
            >
              Réessayer
            </button>
          </div>
          <div className="mt-2 text-sm">
            <p>Vérifiez que :</p>
            <ul className="list-disc list-inside ml-4">
              <li>Le serveur backend est démarré</li>
              <li>L'URL {API_BASE} est accessible</li>
              <li>Le port 5000 n'est pas bloqué</li>
            </ul>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Chargement en cours...</p>
        </div>
      )}

      {/* Contenu principal */}
      <div className="container mx-auto p-4">
        {section === "list" && !loading && (
          <SmartphoneList
            smartphones={filteredSmartphones}
            onSelect={voirDetail}
            supprimer={supprimer}
            onEdit={editPhone}
          />
        )}

        {section === "add" && (
          <AjouterSmartphone
            ajouterSmartphone={ajouterSmartphone}
            onCancel={() => setSection("list")}
            loading={loading}
          />
        )}

        {section === "detail" && selectedPhone && (
          <DetaillerSmartphone
            phone={selectedPhone}
            onCancel={() => setSection("list")}
            onEdit={editPhone}
          />
        )}

        {section === "edit" && editingPhone && (
          <EditerSmartphone
            phone={editingPhone}
            onSave={sauvegarderEdition}
            onCancel={() => {
              setSection("list");
              setEditingPhone(null);
            }}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}

export default Classe;
