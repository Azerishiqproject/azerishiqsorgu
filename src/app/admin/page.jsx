// components/AdminPanel.js
'use client';
import { useState, useEffect } from "react";
import { db } from "../../../firebase";
import { collection, addDoc, query, getDocs, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";

export default function AdminPanel() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const generateRandomId = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const fetchQuestions = async () => {
    const q = query(collection(db, "questions"));
    const querySnapshot = await getDocs(q);
    const questionsArray = [];
    querySnapshot.forEach((doc) => {
      questionsArray.push({ id: doc.id, ...doc.data() });
    });
    setQuestions(questionsArray);
  };

  const addQuestion = async () => {
    try {
      const newId = generateRandomId();
      await addDoc(collection(db, "questions"), {
        title,
        description,
        active: true,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
        randomId: newId,
      });
      fetchQuestions();
      setShowForm(false);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const updateQuestion = async () => {
    if (!editingQuestion) return;
    try {
      const docRef = doc(db, "questions", editingQuestion.id);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) return;

      await updateDoc(docRef, {
        title,
        description,
        slug: title.toLowerCase().replace(/\s+/g, "-"),
      });
      setTitle("");
      setDescription("");
      fetchQuestions();
      setEditingQuestion(null);
    } catch (error) {
      console.error("Hata:", error);
    }
  };

  const deleteQuestion = async (id) => {
    if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      try {
        await deleteDoc(doc(db, "questions", id));
        fetchQuestions();
      } catch (error) {
        console.error("Error deleting question:", error);
      }
    }
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setEditingQuestion(null);
    setShowForm(false);
  };

  const toggleQuestionStatus = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "questions", id), { active: !currentStatus });
      setQuestions(questions.map(q => q.id === id ? { ...q, active: !currentStatus } : q));
    } catch (error) {
      console.error("Error toggling question status:", error);
    }
  };

  const startEditing = (question) => {
    setEditingQuestion(question);
    setTitle(question.title);
    setDescription(question.description);
    setShowForm(true);
  };

  const goToQuestionPage = (slug, id) => {
    router.push(`admin/${id}`);
  };

  // Kullanıcı doğrulama kontrolü (güvenli, server-side doğrulama)
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        localStorage.setItem("isAdminAuthenticated", "true"); // Giriş yapıldığında localStorage'a kaydediyoruz
        fetchQuestions(); // Giriş yapıldığında verileri çek
      } else {
        alert(data.message || "Yanlış parola. Lütfen yenidən cəhd edin.");
      }
    } catch (error) {
      console.error("Login request error:", error);
      alert("Server ilə əlaqə zamanı xəta baş verdi. Zəhmət olmasa sonra yenidən cəhd edin.");
    }
  };

  useEffect(() => {
    const isAuthenticatedInStorage = localStorage.getItem("isAdminAuthenticated") === "true";
    setIsAuthenticated(isAuthenticatedInStorage); // localStorage'dan durumu kontrol ediyoruz

    if (isAuthenticatedInStorage) {
      fetchQuestions();
    }
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {isAuthenticated ? (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
          <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-semibold text-white">Admin Panel</h2>
                <p className="mt-1 text-sm text-slate-200/80">
                  Sualları idarə edin, aktiv/pasiv vəziyyətini dəyişin.
                </p>
              </div>
              <Link href="/">
                <Image src="/images/azerisiq-logo2.png" width={90} height={40} alt="logo" />
              </Link>
            </div>

            <div className="mb-8">
              <button
                className={`mb-4 px-4 py-2 rounded-2xl font-semibold transition-all duration-200 shadow-md ${
                  showForm
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
                onClick={() => {
                  setShowForm(!showForm);
                  if (showForm) clearForm();
                }}
              >
                {showForm ? "Formu gizlət" : "Yeni sual əlavə et"}
              </button>

              {showForm && (
                <div className="mt-3 mb-6 bg-white/10 backdrop-blur-md border border-white/15 shadow-xl rounded-3xl p-6 sm:p-8 space-y-4 text-white">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-200 mb-1">
                        Başlıq
                      </label>
                      <input
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300/70 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                        type="text"
                        placeholder="Suallar üçün başlıq"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-200 mb-1">
                        Açıqlama
                      </label>
                      <textarea
                        className="w-full min-h-[100px] rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300/70 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 resize-y"
                        placeholder="Sualla bağlı qısa açıqlama"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center justify-center px-6 py-3 bg-green-500 text-white font-semibold rounded-2xl shadow-md hover:bg-green-600 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
                    onClick={editingQuestion ? updateQuestion : addQuestion}
                  >
                    {editingQuestion ? "Suallı yenilə" : "Suallı əlavə et"}
                  </button>
                </div>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4">
              Suallar
            </h3>

            {loading ? (
              <p className="text-slate-200">Yüklənir...</p>
            ) : (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {questions.map((question) => (
                  <li
                    key={question.id}
                    className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-5 sm:p-6 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 cursor-pointer ${
                      question.active ? "" : "opacity-80"
                    }`}
                    onClick={() => goToQuestionPage(question.slug, question.id)}
                  >
                    <div className="flex flex-col h-full">
                      <div className="mb-4">
                        <p className="text-xs uppercase tracking-wide text-slate-200/80 mb-1">
                          {question.active ? "Aktiv" : "Passiv"}
                        </p>
                        <h4 className="text-lg font-semibold text-white line-clamp-2">
                          {question.title}
                        </h4>
                        <p className="mt-2 text-sm text-slate-200/90 line-clamp-3">
                          {question.description}
                        </p>
                      </div>

                      <div className="mt-auto pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                        <div className="flex items-center">
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleQuestionStatus(question.id, question.active);
                            }}
                            className={`w-12 h-6 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                              question.active ? "bg-green-500" : "bg-red-500"
                            }`}
                          >
                            <div
                              className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ${
                                question.active ? "translate-x-6" : ""
                              }`}
                            ></div>
                          </div>
                          <span className="ml-2 text-xs text-slate-200">
                            {question.active ? "Aktiv" : "Passiv"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-500 px-3 py-1.5 text-xs text-white hover:bg-blue-600 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(question);
                            }}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                            <span>Edit</span>
                          </button>
                          <button
                            className="inline-flex items-center gap-1 rounded-xl bg-red-500 px-3 py-1.5 text-xs text-white hover:bg-red-600 transition-all"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteQuestion(question.id);
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                            <span>Sil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : (
        <form
          onSubmit={handlePasswordSubmit}
          className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4"
        >
          <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/15 rounded-3xl px-8 py-10 shadow-2xl text-center text-white">
            <div className="flex flex-col items-center mb-6">
              <Image
                src="/images/azerisiq-logo.png"
                alt="logo"
                width={110}
                height={220}
                className="mb-4"
              />
              <h2 className="text-2xl font-semibold tracking-wide">Admin Girişi</h2>
              <p className="mt-2 text-sm text-slate-200/80">
                Panelə daxil olmaq üçün parolanı daxil edin.
              </p>
            </div>

            <div className="mt-6 text-left">
              <label className="block text-xs font-medium text-slate-200 mb-1">
                Parola
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Parolanızı daxil edin"
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-300/70 outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-blue-600 hover:shadow-xl active:scale-[0.98] transition-all duration-200"
            >
              Giriş Et
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
