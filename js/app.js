document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // MAIN NAVIGATION (TOP TABS)
    // ----------------------------------------------------------------------
    const mainNavBtns = document.querySelectorAll('.main-nav .nav-btn');
    const viewSections = document.querySelectorAll('.view-section');

    mainNavBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all main nav btns
            mainNavBtns.forEach(b => b.classList.remove('active'));
            // Add active to clicked btn
            btn.classList.add('active');
            
            // Hide all view sections
            viewSections.forEach(section => {
                section.classList.remove('active');
                section.style.display = 'none';
            });
            
            // Show target section
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
                // ipa-section uses flex, theory-section uses block
                targetSection.style.display = targetId === 'ipa-section' ? 'block' : 'block';
            }
        });
    });

    // ----------------------------------------------------------------------
    // SIDEBAR NAVIGATION (IPA SECTION)
    // ----------------------------------------------------------------------
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active classes
            navLinks.forEach(n => n.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked link
            link.classList.add('active');

            // Show corresponding section
            const target = link.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    // === Render IPA Chart ===
    const monophthongsGrid = document.getElementById('monophthongs-grid');
    const diphthongsGrid = document.getElementById('diphthongs-grid');
    const consonantsGrid = document.getElementById('consonants-grid');
    const clustersGrid = document.getElementById('clusters-grid');

    // Function to create a sound card
    function createSoundCard(sound, typeClass) {
        const div = document.createElement('div');
        div.className = `sound-card ${typeClass} ${sound.voiced ? 'voiced' : ''}`;
        div.innerHTML = `
            <span class="phonetic">/${sound.phonetic}/</span>
            <span class="example">${sound.word}</span>
        `;
        div.addEventListener('click', () => openModal(sound));
        return div;
    }

    // Render Monophthongs
    ipaData.vowels.monophthongs.forEach(sound => {
        monophthongsGrid.appendChild(createSoundCard(sound, 'monophthong'));
    });

    // Render Diphthongs
    ipaData.vowels.diphthongs.forEach(sound => {
        diphthongsGrid.appendChild(createSoundCard(sound, 'diphthong'));
    });

    // Render Consonants
    ipaData.consonants.forEach(sound => {
        consonantsGrid.appendChild(createSoundCard(sound, 'consonant'));
    });

    // Render Clusters
    if (ipaData.clusters) {
        ipaData.clusters.forEach(sound => {
            clustersGrid.appendChild(createSoundCard(sound, 'cluster'));
        });
    }

    // === Modal Logic ===
    const modal = document.getElementById('sound-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalSound = document.getElementById('modal-sound');
    const modalType = document.getElementById('modal-type');
    const modalPlayBtn = document.getElementById('modal-play-btn');

    // Flashcard Elements
    const flashcardWord = document.getElementById('flashcard-word');
    const flashcardIpa = document.getElementById('flashcard-ipa');
    const flashcardMeaning = document.getElementById('flashcard-meaning');
    const flashcardPlayBtn = document.getElementById('flashcard-play');
    const btnNextWord = document.getElementById('btn-next-word');
    const wordCounter = document.getElementById('word-counter');
    const flashcardTabs = document.getElementById('flashcard-tabs');
    const tabBtns = document.querySelectorAll('.tab-btn');

    let currentSound = null;
    let currentShuffledExamples = [];
    let currentWordIndex = 0;
    let currentPosition = 'initial';

    // Helper to shuffle array
    function shuffleArray(array) {
        let newArr = [...array];
        for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
        }
        return newArr;
    }

    function loadCurrentList() {
        if (currentSound.type.includes('Vowel') || currentSound.type.includes('Diphthong')) {
            currentShuffledExamples = shuffleArray(currentSound.examples || []);
        } else {
            if (currentPosition === 'initial') {
                currentShuffledExamples = shuffleArray(currentSound.examplesInitial || []);
            } else if (currentPosition === 'medial') {
                currentShuffledExamples = shuffleArray(currentSound.examplesMedial || []);
            } else {
                currentShuffledExamples = shuffleArray(currentSound.examplesFinal || []);
            }
        }
        currentWordIndex = 0;
    }

    function updateTabStyles() {
        tabBtns.forEach(b => b.classList.remove('active'));
        if (currentPosition === 'initial') tabBtns[0].classList.add('active');
        if (currentPosition === 'medial') tabBtns[1].classList.add('active');
        if (currentPosition === 'final') tabBtns[2].classList.add('active');
    }

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled) return;
            currentPosition = btn.getAttribute('data-pos');
            updateTabStyles();
            loadCurrentList();
            updateFlashcard();
        });
    });

    function openModal(sound) {
        currentSound = sound;
        modalSound.textContent = `/${sound.phonetic}/`;
        modalType.textContent = sound.type;
        
        if (sound.type.includes('Vowel') || sound.type.includes('Diphthong')) {
            flashcardTabs.style.display = 'none';
            loadCurrentList();
        } else {
            flashcardTabs.style.display = 'flex';
            const hasInitial = sound.examplesInitial && sound.examplesInitial.length > 0;
            const hasMedial = sound.examplesMedial && sound.examplesMedial.length > 0;
            const hasFinal = sound.examplesFinal && sound.examplesFinal.length > 0;
            
            tabBtns[0].disabled = !hasInitial;
            tabBtns[1].disabled = !hasMedial;
            tabBtns[2].disabled = !hasFinal;
            
            // Auto select available tab
            if (hasInitial) currentPosition = 'initial';
            else if (hasMedial) currentPosition = 'medial';
            else currentPosition = 'final';
            
            updateTabStyles();
            loadCurrentList();
        }
        
        updateFlashcard();

        modal.classList.add('active');
    }

    function updateFlashcard() {
        if(currentShuffledExamples.length === 0) {
            flashcardWord.textContent = '(Không có từ ví dụ)';
            flashcardIpa.textContent = '';
            flashcardMeaning.textContent = '';
            wordCounter.textContent = '0/0';
            return;
        }
        
        const currentData = currentShuffledExamples[currentWordIndex];
        const parts = currentData.split('|');
        const word = parts[0] || '';
        const ipaStr = parts[1] || '';
        const type = parts[2] || '';
        const meaning = parts[3] || '';
        
        flashcardWord.textContent = word;
        flashcardIpa.textContent = ipaStr;
        
        if (type || meaning) {
            flashcardMeaning.textContent = `${type} ${meaning}`.trim();
        } else {
            flashcardMeaning.textContent = '';
        }
        
        wordCounter.textContent = `${currentWordIndex + 1}/${currentShuffledExamples.length}`;
        
        // Tự động phát âm khi chuyển từ
        speak(word);
    }

    btnNextWord.addEventListener('click', () => {
        if(currentShuffledExamples.length === 0) return;
        currentWordIndex = (currentWordIndex + 1) % currentShuffledExamples.length;
        
        // Hiệu ứng chuyển từ
        const container = document.querySelector('.flashcard-container');
        container.style.opacity = '0.5';
        setTimeout(() => {
            updateFlashcard();
            container.style.opacity = '1';
        }, 150);
    });

    flashcardPlayBtn.addEventListener('click', () => {
        if(currentShuffledExamples.length > 0) {
            const word = currentShuffledExamples[currentWordIndex].split('|')[0];
            speak(word);
        }
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modalPlayBtn.addEventListener('click', () => {
        if(currentSound && currentShuffledExamples.length > 0) {
            const word = currentShuffledExamples[currentWordIndex].split('|')[0];
            speak(word);
        }
    });

    // Close modal on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // === Text to Speech using Web Speech API ===
    window.speak = function(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-GB'; // British English for Pronunciation in Use
            utterance.rate = 0.8; // Slightly slower for clear pronunciation
            speechSynthesis.speak(utterance);
        } else {
            console.error('Speech Synthesis not supported in this browser.');
        }
    }

    function playPhoneticSound(word) {
        // Since we don't have isolated IPA sound files, 
        // we'll pronounce the representative word slowly.
        speak(word);
    }

    // === Record & Compare Logic ===
    const btnRecord = document.getElementById('btn-record');
    const btnListenTarget = document.getElementById('btn-listen-target');
    const userAudio = document.getElementById('user-audio');
    const playbackArea = document.querySelector('.playback-area');

    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    btnListenTarget.addEventListener('click', () => {
        speak('sheep');
    });

    // Setup MediaRecorder
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = e => {
                    audioChunks.push(e.data);
                };

                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    userAudio.src = audioUrl;
                    playbackArea.style.display = 'block';
                    audioChunks = []; // reset for next recording
                };
            })
            .catch(err => {
                console.error('Error accessing microphone:', err);
                btnRecord.disabled = true;
                btnRecord.innerHTML = '<i class="fa-solid fa-microphone-slash"></i> Không có mic';
            });
    }

    btnRecord.addEventListener('click', () => {
        if (!mediaRecorder) return;

        if (isRecording) {
            // Stop recording
            mediaRecorder.stop();
            btnRecord.classList.remove('recording');
            btnRecord.innerHTML = '<i class="fa-solid fa-microphone"></i> <span>Bắt đầu ghi âm</span>';
            isRecording = false;
        } else {
            // Start recording
            mediaRecorder.start();
            btnRecord.classList.add('recording');
            btnRecord.innerHTML = '<i class="fa-solid fa-stop"></i> <span>Dừng ghi âm</span>';
            isRecording = true;
            playbackArea.style.display = 'none';
        }
    });
});
