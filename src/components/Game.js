import React, { useState, useEffect } from 'react';
import gameData from './gameData.json';
import ConfettiComponent from './ConfettiComponent';
import Navbar from './Navbar';
import ProgressBar from './ProgressBar';
import ImageGrid from './ImageGrid';
import AudioIcon from './AudioIcon';
import SummaryScreen from './SummaryScreen';
import './styles.css';

function Game() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [shuffledData, setShuffledData] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [completionTime, setCompletionTime] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(1);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const totalScreens = shuffledData.length;
  const [gameCompleted, setGameCompleted] = useState(false);

  // Utility function to shuffle an array
  const shuffleArray = (array) => {
    return array.slice().sort(() => Math.random() - 0.5);
  };

  // Shuffle game data on component mount
  useEffect(() => {
    const shuffleData = () => {
      const shuffled = gameData.map(item => {
        const shuffledImages = shuffleArray(item.images);
        return { ...item, images: shuffledImages };
      });
      setShuffledData(shuffled);
    };
    shuffleData();
    setStartTime(Date.now());
  }, []);

  // Reset game state when moving to the next level
  useEffect(() => {
    setSelectedImage(null);
    setBackgroundColors([]);
    setShowConfetti(false);
    setFeedbackMessage('');
  }, [currentLevel]);

  // Update elapsed time every second
  useEffect(() => {
    let interval;
    if (startTime !== null) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        setElapsedTime(elapsed >= 0 ? elapsed : 0);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime]);

  const handleChoice = (chosenImage, index) => {
    setAttempts(attempts + 1);
    const correctAnswer = shuffledData[currentLevel].correctAnswer;
    if (chosenImage === correctAnswer) {
      setShowConfetti(true);
      setFeedbackMessage('Correct');
      const newBackgroundColors = shuffledData[currentLevel].images.map((_, i) =>
        i === correctAnswer ? 'correct-blink' : 'transparent'
      );
      setBackgroundColors(newBackgroundColors);
      setShowNextButton(true);

      if (currentLevel === shuffledData.length - 1) {
        setTimeout(() => {
          setCompletionTime(Date.now() - startTime);
          setGameCompleted(true);
        }, 4000);
      }
    } else {
      setFeedbackMessage('Incorrect');
      const newBackgroundColors = shuffledData[currentLevel].images.map((_, i) =>
        i === index ? 'incorrect-blink' : 'transparent'
      );
      setBackgroundColors(newBackgroundColors);
      setTimeout(() => {
        setFeedbackMessage('');
        setBackgroundColors([]);
      }, 4000);
    }
    setSelectedImage(chosenImage);
  };

  const handleNextLevel = () => {
    if (currentLevel + 1 < shuffledData.length) {
      setCurrentLevel(currentLevel + 1);
      setCurrentScreen(currentScreen + 1);
      setSelectedImage(null);
      setBackgroundColors([]);
      setShowConfetti(false);
      setShowNextButton(false);
    }
  };

  const handleNextButtonClick = () => {
    handleNextLevel();
  };

  const handlePlayAgain = () => {
    setCurrentLevel(0);
    setSelectedImage(null);
    setBackgroundColors([]);
    setShowConfetti(false);
    setAttempts(0);
    setStartTime(Date.now());
    setElapsedTime(0);
    setCompletionTime(null);
    setGameCompleted(false);
    setCurrentScreen(1);
    setShowNextButton(false);
  };

  const progressPercentage = (currentScreen / totalScreens) * 100;

  if (gameCompleted) {
    return (
      <SummaryScreen 
        totalAttempts={attempts} 
        totalElapsedTime={completionTime} 
        handlePlayAgain={handlePlayAgain} 
      />
    );
  }

  return (
    <div className="game-container" style={{
      position: 'relative',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'repeat'
    }}>
      <Navbar attempts={attempts} elapsedTime={elapsedTime} currentScreen={currentScreen} totalScreens={totalScreens} />
      {showConfetti && <ConfettiComponent />}

      {shuffledData.length > 0 && (
        <>
          <ProgressBar progressPercentage={progressPercentage} />

          <div className="transparent-box">
            <AudioIcon sentence={shuffledData[currentLevel].sentence} />

            <div className="sentence" style={{ textAlign: 'center', fontFamily:'sans-serif', width: '100%' }}>
              {shuffledData[currentLevel].sentence}
            </div>
          </div>

          {feedbackMessage && (
            <div className="feedback-message" style={{ textAlign: 'center', fontSize: '1.1rem', marginBottom: '0.5vh', color: feedbackMessage === 'Correct' ? 'green' : 'red' }}>
              {feedbackMessage}
            </div>
          )}

          <ImageGrid
            images={shuffledData[currentLevel].images}
            screen={shuffledData[currentLevel].screen}
            backgroundColors={backgroundColors}
            handleChoice={handleChoice}
          />

          {showNextButton && currentLevel < shuffledData.length - 1 && (
            <div style={{ textAlign: 'center', marginTop: '1vh' }}>
              <button onClick={handleNextButtonClick} className="next-button">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Game;
