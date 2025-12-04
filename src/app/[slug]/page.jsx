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
  const [error, setError] = useState(null); // State to handle errors
  const [showSnackbar, setShowSnackbar] = useState(false); // Snackbar visibility
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
    if (!answer) return; // Validate answer input

    try {
      const questionRef = doc(db, 'questions', slug); // Reference to the question document
      // Update the answers array in the question document
      await updateDoc(questionRef, {
        answers: [...(question.answers || []), { answer: answer, createdAt: new Date() }] // Append the new answer
      });
      setAnswer(''); // Clear the answer input after submission
      setShowSnackbar(true); // Show success snackbar

      // Redirect to the home page after a short delay
      setTimeout(() => {
        router.push('/'); // Change to your actual home page path
      }, 2000);

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
        <div className="max-w-2xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg mt-10">
          <h1 className="text-2xl font-bold mb-4 text-black">{question.title}</h1>
          <p className="text-gray-700 mb-6">{question.description}</p>
  
          {/* Answer submission form */}
          <form onSubmit={handleSubmit} className="mt-4 text-black space-y-4">
            <textarea
              value={answer}
              onChange={handleAnswerChange}
              placeholder="Cavabınızı yazın..."
              className="w-full min-h-[140px] resize-y border border-gray-200 rounded-2xl px-4 py-3 bg-white/80 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 transition-all duration-200"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white rounded-2xl px-4 py-3 font-semibold shadow-md hover:bg-blue-700 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              Cavabınızı göndərin
            </button>
          </form>
        </div>
      </div>
      
      <div className="h-[50px] w-full bottom-0 justify-center absolute z-10 text-black">
        <h2 className="text-xs font-semibold italic w-full text-center">UĞUR, İNKİŞAF VƏ FƏRQLİLİYƏ GEDƏN</h2>
        <h2 className="text-xs font-semibold italic w-full text-center">“İŞIQLI YOL”</h2>
      </div>

      {showSnackbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="px-6 py-3 rounded-2xl bg-green-600 text-white shadow-lg text-sm sm:text-base">
            Sorğuda iştirak etdiyiniz üçün təşəkkürlər.
          </div>
        </div>
      )}
    </div>
  );
  
}
