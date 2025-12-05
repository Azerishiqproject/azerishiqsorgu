'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; 
import { db } from '../../../firebase';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function QuestionDetails() {
  const { slug } = useParams(); // Get the slug directly from URL
  const [question, setQuestion] = useState(null); // State to hold the fetched question
  const [loading, setLoading] = useState(true); // State to track loading status
  const [answer, setAnswer] = useState(''); // State to hold the user's answer
  const [selectedVariants, setSelectedVariants] = useState([]); // State to hold selected variants (array for multiple selections)
  const [error, setError] = useState(null); // State to handle errors
  const [showSnackbar, setShowSnackbar] = useState(false); // Snackbar visibility
  const [hasAnswered, setHasAnswered] = useState(false); // Check if user has already answered
  const router = useRouter(); // Initialize the router for navigation

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        // Fetch the question
        const questionsRef = collection(db, 'questions');
        const querySnapshot = await getDocs(questionsRef);
        const questionsArray = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const matchedQuestion = questionsArray.find(question => question.id === slug);
        if (matchedQuestion) {
          setQuestion(matchedQuestion);
          
          // Check if user has already answered this question
          const answeredKey = `answered_question_${slug}`;
          const hasAnsweredBefore = localStorage.getItem(answeredKey);
          if (hasAnsweredBefore) {
            setHasAnswered(true);
          }
        } else {
          setError(`No question found with ID: ${slug}`);
        }
      } catch (error) {
        setError('Error fetching data: ' + error.message);
      }
      setLoading(false); // Set loading to false after fetch
    };

    fetchQuestion();
  }, [slug]); // Depend on slug to re-run the effect when it changes

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value); // Update answer state with user input
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
    
    // Check if already answered
    if (hasAnswered) {
      alert('Bu suala artıq cavab vermisiniz.');
      return;
    }
    
    const questionType = question.questionType || 'text';
    let answerToSubmit = '';
    
    if (questionType === 'text') {
      if (!answer.trim()) return; // Validate answer input
      answerToSubmit = answer;
    } else if (questionType === 'variant') {
      if (selectedVariants.length === 0) {
        alert('Zəhmət olmasa ən azı bir variant seçin.');
        return;
      }
      const maxSelections = question.maxSelections || 1;
      if (selectedVariants.length > maxSelections) {
        alert(`Maksimum ${maxSelections} variant seçə bilərsiniz.`);
        return;
      }
      // Store as array for multiple selections
      answerToSubmit = JSON.stringify(selectedVariants);
    }

    try {
      const questionRef = doc(db, 'questions', slug); // Reference to the question document
      // Update the answers array in the question document
      await updateDoc(questionRef, {
        answers: [...(question.answers || []), { answer: answerToSubmit, createdAt: new Date() }] // Append the new answer
      });
      
      // Save to localStorage that user has answered this question (do this immediately)
      const answeredKey = `answered_question_${slug}`;
      localStorage.setItem(answeredKey, 'true');
      setHasAnswered(true);
      
      setAnswer(''); // Clear the answer input after submission
      setSelectedVariants([]); // Clear selected variants
      setShowSnackbar(true); // Show success snackbar

      // Redirect to the home page after showing snackbar (3 seconds to see the message)
      setTimeout(() => {
        router.push('/'); // Redirect to home page
      }, 3000);

    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Cavabınızı göndərərkən xəta baş verdi.'); // Notify user of error
    }
  };

  if (loading) {
    return <div className="text-center bg-white w-full h-screen flex items-center justify-center text-black text-3xl">Loading...</div>; // Loading state while waiting for question data
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>; // Display error if any
  }

  if (!question) {
    return <div className="text-center">No question found. {slug}</div>; // Handle case where question is not found
  }

  return (
    <div className="bg-white min-h-screen relative"> {/* Full page background set to white */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: "url('/images/bg.png')", zIndex: 0 }}
      ></div>
  
      <div className='flex flex-col w-full h-[100px] justify-center items-start mb-8 pl-8 p-4 relative z-10'>
        <Image src='/images/azerisiq-logo.png' alt="logo" width={200} height={200} />
        <h2 className="pt-2 text-xs font-semibold italic text-black">KOMANDA QURUCULUĞU və İNNOVATİV HƏLLƏR</h2>
      </div> 
  
      <div className='w-full flex justify-center p-4 relative z-10'>
        <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg mt-10 mb-20 relative">
          <h1 className="text-2xl font-bold mb-6 text-black">{question.title}</h1>
  
          {/* Success Snackbar - shown above the form */}
          {showSnackbar && (
            <div className="mb-4 p-4 bg-green-600 text-white rounded-2xl shadow-lg text-center">
              <p className="font-semibold">Sorğuda iştirak etdiyiniz üçün təşəkkürlər.</p>
            </div>
          )}

          {/* Show message if already answered */}
          {hasAnswered && !showSnackbar && (
            <div className="mt-4 p-6 bg-yellow-50 border-2 border-yellow-400 rounded-2xl text-center">
              <p className="text-lg font-semibold text-yellow-800 mb-2">
                Bu suala artıq cavab vermisiniz
              </p>
              <p className="text-sm text-yellow-700">
                Hər suala yalnız bir dəfə cavab verə bilərsiniz.
              </p>
            </div>
          )}

          {/* Answer submission form */}
          {!hasAnswered && (
            <form onSubmit={handleSubmit} className="mt-4 text-black space-y-4">
            {(!question.questionType || question.questionType === 'text') ? (
              <textarea
                value={answer}
                onChange={handleAnswerChange}
                placeholder="Cavabınızı yazın..."
                className="w-full min-h-[140px] resize-y border border-gray-200 rounded-2xl px-4 py-3 bg-white/80 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-all duration-200"
                required
              />
            ) : (
              <div className="space-y-3 ">
                {question.variants && question.variants.length > 0 ? (
                  <>
                    {question.maxSelections > 1 && (
                      <p className="text-sm text-gray-600 mb-2">
                        {question.maxSelections} variant seçə bilərsiniz. ({selectedVariants.length}/{question.maxSelections} seçildi)
                      </p>
                    )}
                    {question.variants.map((variant, index) => {
                      const isSelected = selectedVariants.includes(variant.text);
                      const maxSelections = question.maxSelections || 1;
                      const canSelect = selectedVariants.length < maxSelections || isSelected;
                      
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              // Deselect
                              setSelectedVariants(selectedVariants.filter(v => v !== variant.text));
                            } else {
                              // Select (if under limit)
                              if (canSelect) {
                                setSelectedVariants([...selectedVariants, variant.text]);
                              } else {
                                alert(`Maksimum ${maxSelections} variant seçə bilərsiniz.`);
                              }
                            }
                          }}
                          disabled={!canSelect && !isSelected}
                          className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all duration-200 font-medium ${
                            isSelected
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-[1.02]'
                              : canSelect
                              ? 'bg-white/80 text-gray-700 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                              : 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed opacity-50'
                          }`}
                        >
                          {variant.text}
                          {isSelected && (
                            <span className="ml-2 text-xs">✓</span>
                          )}
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <p className="text-gray-500 text-sm">Variantlar tapılmadı.</p>
                )}
              </div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-2xl px-4 py-3 font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              Cavabınızı göndərin
            </button>
          </form>
          )}
        </div>
      </div>
      
      <div className="h-[50px] w-full bottom-0 justify-center absolute z-10 text-black ">
        <h2 className="text-xs font-semibold italic w-full text-center">UĞUR, İNKİŞAF VƏ FƏRQLİLİYƏ GEDƏN</h2>
        <h2 className="text-xs font-semibold italic w-full text-center">“İŞIQLI YOL”</h2>
      </div>

    </div>
  );
  
}
