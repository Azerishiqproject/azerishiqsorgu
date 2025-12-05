"use client";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter , useParams } from 'next/navigation';  // Correct import
import { motion } from "framer-motion";
import { db } from '../../../../../firebase';
import { collection, getDocs } from 'firebase/firestore';

const isLongResponse = (text, limit = 17) => text.length > limit;

const CircularResponseGrid = () => {
  const router = useRouter();  // Using useRouter hook
  const { slug } = useParams();  // Accessing the slug from the router.query
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;  // If slug is not available yet, return early

    const fetchQuestion = async () => {
      try {
        const questionsRef = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        const questionsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const matchedQuestion = questionsArray.find(question => question.id === slug);
        if (matchedQuestion) {
          setQuestion(matchedQuestion);
        } else {
          setError(`No question found with ID: ${slug}`);
        }
      } catch (err) {
        setError('Error fetching data: ' + err.message);
      }
      setLoading(false);
    };

    fetchQuestion();
  }, [slug]);  // Fetch when slug changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!question) {
    return <div>No question found. {slug}</div>;
  }

  // Calculate variant statistics for variant questions
  const getVariantStats = () => {
    if (!question || !question.variants || question.questionType !== 'variant') {
      return {};
    }

    const stats = {};
    question.variants.forEach(variant => {
      stats[variant.text] = 0;
    });

    if (question.answers) {
      question.answers.forEach(answer => {
        const answerText = answer.answer;
        // Check if answer is JSON array (multiple selections)
        try {
          const parsed = JSON.parse(answerText);
          if (Array.isArray(parsed)) {
            // Multiple selections
            parsed.forEach(variantText => {
              if (stats.hasOwnProperty(variantText)) {
                stats[variantText]++;
              }
            });
          } else {
            // Single selection (old format)
            if (stats.hasOwnProperty(answerText)) {
              stats[answerText]++;
            }
          }
        } catch (e) {
          // Not JSON, treat as single selection
          if (stats.hasOwnProperty(answerText)) {
            stats[answerText]++;
          }
        }
      });
    }

    return stats;
  };

  const variantStats = getVariantStats();
  const totalAnswers = question?.answers ? question.answers.length : 0;
  const isVariantQuestion = question.questionType === 'variant' && question.variants && question.variants.length > 0;

  return (
    <div className="relative w-full min-h-screen overflow-y-auto flex flex-col items-center bg-[#F8F0E2]">
      <div className="absolute inset-0 bg-cover bg-center opacity-50 "
        style={{ backgroundImage: "url('/images/presBgImage.png')", zIndex: 0 }}></div>

      <div className="w-full flex flex-col items-start p-8 z-10">
        <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
        <h2 className="pt-2 text-xs font-semibold italic text-black">KOMANDA QURUCULUĞU və İNNOVATİV HƏLLƏR</h2>
      </div>

      <div className="flex-grow flex justify-center items-center p-4 pt-1 pb-8 w-full z-10">
        {isVariantQuestion ? (
          // Variant Statistics Table
          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 mb-6">
              <h2 className="text-3xl font-bold text-blue-900 mb-2 text-center">{question.title}</h2>
              <p className="text-center text-blue-700 mb-6">Ümumi cavab sayı: {totalAnswers}</p>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#D8BA8D] text-blue-900">
                      <th className="px-6 py-4 text-left font-bold text-lg rounded-tl-2xl">Variant</th>
                      <th className="px-6 py-4 text-center font-bold text-lg">Seçim sayı</th>
                      <th className="px-6 py-4 text-center font-bold text-lg">Faiz</th>
                      <th className="px-6 py-4 text-center font-bold text-lg rounded-tr-2xl">Grafik</th>
                    </tr>
                  </thead>
                  <tbody>
                    {question.variants.map((variant, idx) => {
                      const count = variantStats[variant.text] || 0;
                      const percentage = totalAnswers > 0 ? ((count / totalAnswers) * 100).toFixed(1) : 0;
                      const isLast = idx === question.variants.length - 1;
                      
                      return (
                        <motion.tr
                          key={idx}
                          className={`border-b border-[#D8BA8D]/30 hover:bg-[#D8BA8D]/10 transition-colors ${isLast ? 'border-b-0' : ''}`}
                          initial={{ opacity: 0, x: -50 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <td className="px-6 py-4 text-blue-900 font-semibold text-lg">
                            {variant.text}
                          </td>
                          <td className="px-6 py-4 text-center text-blue-900 font-bold text-xl">
                            {count}
                          </td>
                          <td className="px-6 py-4 text-center text-blue-900 font-semibold text-lg">
                            {percentage}%
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center">
                              <div className="w-full max-w-xs bg-gray-200 rounded-full h-6 overflow-hidden shadow-inner">
                                <motion.div
                                  className="bg-gradient-to-r from-[#D8BA8D] to-[#C4A574] h-6 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 + 0.3 }}
                                />
                              </div>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Text Answers Grid (existing view)
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full">
            {question.answers && question.answers.map((ans, index) => (
              <motion.div
                key={index}
                className={`bg-[#D8BA8D] bg-opacity-95 text-blue-900 p-6 rounded-full text-center shadow-md ${isLongResponse(ans.answer) ? "col-span-2" : ""}`}
                initial={{ opacity: 0, rotateY: -180 }}
                animate={{ opacity: 1, rotateY: 0 }}
                transition={{ type: "spring", stiffness: 70, damping: 25, delay: index * 0.1 }}
                style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
              >
                <p className="text-sm font-semibold">{ans.answer}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full text-black flex flex-col items-center py-2 mt-auto z-20">
        <h2 className="text-xs font-semibold italic">UĞUR, İNKİŞAF VƏ FƏRQLİLİYƏ GEDƏN</h2>
        <h2 className="text-xs font-semibold italic">“İŞIQLI YOL”</h2>
      </div>
    </div>
  );
};

const App = () => <CircularResponseGrid />;

export default App;
