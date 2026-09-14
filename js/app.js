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

    // Render Tricky
    const trickyGrid = document.getElementById('tricky-grid');
    if (ipaData.tricky && trickyGrid) {
        ipaData.tricky.forEach(sound => {
            trickyGrid.appendChild(createSoundCard(sound, 'cluster'));
        });
    }

    // Render Connected Speech Phrases
    const csPhrasesGrid = document.getElementById('cs-phrases-grid');
    if (ipaData.connectedSpeech && csPhrasesGrid) {
        ipaData.connectedSpeech.forEach(sound => {
            csPhrasesGrid.appendChild(createSoundCard(sound, 'consonant'));
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
            flashcardWord.textContent = '(KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ tÃƒÂ¡Ã‚Â»Ã‚Â« vÃƒÆ’Ã‚Â­ dÃƒÂ¡Ã‚Â»Ã‚Â¥)';
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
        
        // TÃƒÂ¡Ã‚Â»Ã‚Â± Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚Â»Ã¢â€žÂ¢ng phÃƒÆ’Ã‚Â¡t ÃƒÆ’Ã‚Â¢m khi chuyÃƒÂ¡Ã‚Â»Ã†â€™n tÃƒÂ¡Ã‚Â»Ã‚Â«
        speak(word);
    }

    btnNextWord.addEventListener('click', () => {
        if(currentShuffledExamples.length === 0) return;
        currentWordIndex = (currentWordIndex + 1) % currentShuffledExamples.length;
        
        // HiÃƒÂ¡Ã‚Â»Ã¢â‚¬Â¡u ÃƒÂ¡Ã‚Â»Ã‚Â©ng chuyÃƒÂ¡Ã‚Â»Ã†â€™n tÃƒÂ¡Ã‚Â»Ã‚Â«
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
    const PREFERRED_US_VOICES = [
        "Microsoft Aria Online (Natural) - English (United States)",
        "Google US English",
        "en-US"
    ];
    const PREFERRED_UK_VOICES = [
        "Microsoft Sonia Online (Natural) - English (United Kingdom)",
        "Google UK English Female",
        "Google UK English Male",
        "en-GB"
    ];

    let availableVoices = [];
    
    function loadVoices() {
        if ('speechSynthesis' in window) {
            availableVoices = window.speechSynthesis.getVoices();
        }
    }
    
    if ('speechSynthesis' in window) {
        loadVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = loadVoices;
        }
    }

    window.speak = function(text) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            
            const voiceSelect = document.getElementById('global-voice-select');
            const targetAccent = voiceSelect ? voiceSelect.value : 'UK';
            
            utterance.lang = targetAccent === 'UK' ? 'en-GB' : 'en-US';
            utterance.rate = 0.8;
            
            let targetVoice = null;
            const preferredList = targetAccent === 'UK' ? PREFERRED_UK_VOICES : PREFERRED_US_VOICES;
            
            if (availableVoices.length > 0) {
                // First attempt: Match by exact preferred name
                for (let pref of preferredList) {
                    targetVoice = availableVoices.find(v => v.name.includes(pref));
                    if (targetVoice) break;
                }
                
                // Second attempt: Match by language prefix
                if (!targetVoice) {
                    const langPrefix = targetAccent === 'UK' ? 'en-GB' : 'en-US';
                    targetVoice = availableVoices.find(v => v.lang.startsWith(langPrefix));
                }
                
                if (targetVoice) {
                    utterance.voice = targetVoice;
                }
            }
            
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
                btnRecord.innerHTML = '<i class="fa-solid fa-microphone-slash"></i> KhÃƒÆ’Ã‚Â´ng cÃƒÆ’Ã‚Â³ mic';
            });
    }

    btnRecord.addEventListener('click', () => {
        if (!mediaRecorder) return;

        if (isRecording) {
            // Stop recording
            mediaRecorder.stop();
            btnRecord.classList.remove('recording');
            btnRecord.innerHTML = '<i class="fa-solid fa-microphone"></i> <span>BÃƒÂ¡Ã‚ÂºÃ‚Â¯t Ãƒâ€žÃ¢â‚¬ËœÃƒÂ¡Ã‚ÂºÃ‚Â§u ghi ÃƒÆ’Ã‚Â¢m</span>';
            isRecording = false;
        } else {
            // Start recording
            mediaRecorder.start();
            btnRecord.classList.add('recording');
            btnRecord.innerHTML = '<i class="fa-solid fa-stop"></i> <span>DÃƒÂ¡Ã‚Â»Ã‚Â«ng ghi ÃƒÆ’Ã‚Â¢m</span>';
            isRecording = true;
            playbackArea.style.display = 'none';
        }
    });

    // === Minimal Pairs Logic ===
    const mpChipsContainer = document.getElementById('mp-chips');
    const mpDetailContainer = document.getElementById('mp-detail');
    const mpDetailTitle = document.getElementById('mp-detail-title');
    const mpTableBody = document.getElementById('mp-table-body');

    if (ipaData.minimalPairs && mpChipsContainer) {
        ipaData.minimalPairs.forEach((group, index) => {
            const btn = document.createElement('button');
            btn.className = 'mp-chip';
            btn.textContent = group.title;
            btn.addEventListener('click', () => {
                // Set active style
                document.querySelectorAll('.mp-chip').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show container
                mpDetailContainer.style.display = 'block';
                mpDetailTitle.textContent = group.title;
                
                // Render table
                mpTableBody.innerHTML = '';
                group.pairs.forEach(pair => {
                    const row = document.createElement('div');
                    row.className = 'mp-row';
                    row.innerHTML = `
                        <div class="mp-word">
                            <strong>${pair[0]}</strong>
                            <span>${pair[1]}</span>
                            <small>${pair[2]}</small>
                            <button class="btn-play-small" onclick="window.speak('${pair[0]}')" style="margin-top:10px;"><i class="fa-solid fa-volume-high"></i></button>
                        </div>
                        <div class="mp-vs">VS</div>
                        <div class="mp-word">
                            <strong>${pair[3]}</strong>
                            <span>${pair[4]}</span>
                            <small>${pair[5]}</small>
                            <button class="btn-play-small" onclick="window.speak('${pair[3]}')" style="margin-top:10px;"><i class="fa-solid fa-volume-high"></i></button>
                        </div>
                    `;
                    mpTableBody.appendChild(row);
                });
            });
            mpChipsContainer.appendChild(btn);
        });
    }

        // === Minimal Pairs Quiz Logic ===
    const mpQuizPlayBtn = document.getElementById('mp-quiz-play-btn');
    const mpOpt1 = document.getElementById('mp-opt-1');
    const mpOpt2 = document.getElementById('mp-opt-2');
    const mpQuizFeedback = document.getElementById('mp-quiz-feedback');
    const mpQuizNextBtn = document.getElementById('mp-quiz-next-btn');
    const mpQuizScore = document.getElementById('mp-quiz-score');
    const mpQuizFilter = document.getElementById('mp-quiz-filter');

    if (mpQuizPlayBtn) {
        let currentQuizPair = null;
        let correctAnswerIndex = 0; // 1 or 2
        let score = 0;
        let totalQuestions = 0;
        let hasAnswered = false;
        
        // Track unused questions to avoid repetition
        let unusedPairs = [];

        // Render filter options
        if (ipaData.minimalPairs && mpQuizFilter) {
            ipaData.minimalPairs.forEach((group, index) => {
                const opt = document.createElement('option');
                opt.value = index;
                opt.textContent = group.title;
                mpQuizFilter.appendChild(opt);
            });
            
            // Handle filter change
            mpQuizFilter.addEventListener('change', () => {
                score = 0;
                totalQuestions = 0;
                mpQuizScore.textContent = 'Điểm: 0 / 0';
                unusedPairs = []; // Reset unused pool
                loadNewQuizQuestion();
            });
        }

        function loadNewQuizQuestion() {
            hasAnswered = false;
            mpOpt1.className = 'mp-quiz-option';
            mpOpt2.className = 'mp-quiz-option';
            mpQuizFeedback.textContent = '';
            mpQuizFeedback.style.color = 'inherit';
            mpQuizNextBtn.style.display = 'none';

            const groups = ipaData.minimalPairs;
            if (!groups || groups.length === 0) return;

            // If pool is empty, refill it
            if (unusedPairs.length === 0) {
                let pool = [];
                if (mpQuizFilter.value === 'all') {
                    // Refill with all pairs across all groups
                    groups.forEach(g => {
                        g.pairs.forEach(p => pool.push(p));
                    });
                } else {
                    // Refill with pairs from the selected group
                    const selectedGroup = groups[parseInt(mpQuizFilter.value)];
                    pool = [...selectedGroup.pairs];
                }
                // Shuffle the pool
                pool.sort(() => Math.random() - 0.5);
                unusedPairs = pool;
            }
            
            // Pop the next question from the unused pool
            const randomPair = unusedPairs.pop();
            currentQuizPair = randomPair; 

            const correctIsFirst = Math.random() < 0.5;
            const option1IsFirst = Math.random() < 0.5;
            
            if (option1IsFirst) {
                mpOpt1.textContent = randomPair[0];
                mpOpt2.textContent = randomPair[3];
                correctAnswerIndex = correctIsFirst ? 1 : 2;
            } else {
                mpOpt1.textContent = randomPair[3];
                mpOpt2.textContent = randomPair[0];
                correctAnswerIndex = correctIsFirst ? 2 : 1;
            }

            const wordToPlay = correctIsFirst ? randomPair[0] : randomPair[3];
            mpQuizPlayBtn.onclick = () => window.speak(wordToPlay);
        }

        function handleOptionClick(selectedIdx, btn) {
            if (hasAnswered) return;
            hasAnswered = true;
            totalQuestions++;
            
            if (selectedIdx === correctAnswerIndex) {
                btn.classList.add('correct');
                mpQuizFeedback.textContent = '🎉 Chính xác!';
                mpQuizFeedback.style.color = 'var(--accent-success)';
                score++;
            } else {
                btn.classList.add('incorrect');
                mpQuizFeedback.textContent = '❌ Sai rồi! Nghe lại nhé.';
                mpQuizFeedback.style.color = '#ef4444';
                if (correctAnswerIndex === 1) mpOpt1.classList.add('correct');
                else mpOpt2.classList.add('correct');
            }
            
            mpQuizScore.textContent = 'Điểm: ' + score + ' / ' + totalQuestions;
            mpQuizNextBtn.style.display = 'block';
        }

        mpOpt1.addEventListener('click', () => handleOptionClick(1, mpOpt1));
        mpOpt2.addEventListener('click', () => handleOptionClick(2, mpOpt2));
        mpQuizNextBtn.addEventListener('click', loadNewQuizQuestion);

        if (ipaData.minimalPairs) {
            loadNewQuizQuestion();
        }
    }
});

