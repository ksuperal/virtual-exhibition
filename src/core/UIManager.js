export class UIManager {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.modal = document.getElementById('modal');
    this.modalTitle = document.getElementById('modal-title');
    this.modalBody = document.getElementById('modal-body');
    this.closeBtn = document.querySelector('.close-btn');
    this.roomTitle = document.getElementById('room-title');
    this.roomName = document.getElementById('room-name');
    this.roomSubtitle = document.getElementById('room-subtitle');

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Close modal
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.hideModal());
    }

    // Close modal on background click
    if (this.modal) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.hideModal();
        }
      });
    }

    // Close modal on ESC
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' && !this.modal.classList.contains('hidden')) {
        this.hideModal();
      }
    });
  }

  showModal(title, content, onClose = null, onShow = null) {
    if (this.modal && this.modalTitle && this.modalBody) {
      this.modalTitle.textContent = title;

      if (typeof content === 'string') {
        this.modalBody.innerHTML = content;
      } else if (content instanceof HTMLElement) {
        this.modalBody.innerHTML = '';
        this.modalBody.appendChild(content);
      }

      // Store callbacks
      this.onModalClose = onClose;

      this.modal.classList.remove('hidden');

      // Exit pointer lock when modal opens
      if (document.pointerLockElement) {
        document.exitPointerLock();
      }

      // Call onShow callback if provided
      if (onShow) {
        setTimeout(() => onShow(), 0);
      }
    }
  }

  hideModal() {
    if (this.modal) {
      this.modal.classList.add('hidden');

      // Call onClose callback if provided
      if (this.onModalClose) {
        const callback = this.onModalClose;
        this.onModalClose = null; // Clear it
        callback();
      }
    }
  }

  showRoomTitle(title, subtitle = '', duration = 5000) {
    if (this.roomTitle && this.roomName) {
      this.roomName.textContent = title;
      if (this.roomSubtitle) {
        this.roomSubtitle.textContent = subtitle;
      }

      this.roomTitle.classList.remove('hidden');

      if (duration > 0) {
        setTimeout(() => {
          this.hideRoomTitle();
        }, duration);
      }
    }
  }

  hideRoomTitle() {
    if (this.roomTitle) {
      this.roomTitle.classList.add('hidden');
    }
  }

  createTextInputModal(title, placeholder, submitCallback) {
    const container = document.createElement('div');

    const textarea = document.createElement('textarea');
    textarea.className = 'modal-input modal-textarea';
    textarea.placeholder = placeholder;

    const submitBtn = document.createElement('button');
    submitBtn.className = 'modal-button';
    submitBtn.textContent = 'Submit';
    submitBtn.onclick = () => {
      if (textarea.value.trim()) {
        submitCallback(textarea.value);
        this.hideModal();
      }
    };

    container.appendChild(textarea);
    container.appendChild(submitBtn);

    this.showModal(title, container);
    setTimeout(() => textarea.focus(), 100);
  }

  createChoiceModal(title, choices, submitCallback) {
    const container = document.createElement('div');

    choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'modal-button';
      btn.textContent = choice;
      btn.style.display = 'block';
      btn.style.width = '100%';
      btn.style.marginBottom = '10px';
      btn.onclick = () => {
        submitCallback(choice);
        this.hideModal();
      };
      container.appendChild(btn);
    });

    this.showModal(title, container);
  }

  createMultiStepModal(title, steps, currentStep = 0) {
    const container = document.createElement('div');

    const stepContent = document.createElement('div');
    stepContent.className = 'modal-step-content';

    const renderStep = (stepIndex) => {
      const step = steps[stepIndex];
      stepContent.innerHTML = '';

      if (step.type === 'text') {
        const p = document.createElement('p');
        p.textContent = step.content;
        p.style.marginBottom = '20px';
        stepContent.appendChild(p);
      } else if (step.type === 'input') {
        const input = document.createElement(step.multiline ? 'textarea' : 'input');
        input.className = 'modal-input' + (step.multiline ? ' modal-textarea' : '');
        input.placeholder = step.placeholder || '';
        stepContent.appendChild(input);
        step.inputElement = input;
      }

      const btnContainer = document.createElement('div');
      btnContainer.style.marginTop = '20px';

      if (stepIndex > 0) {
        const backBtn = document.createElement('button');
        backBtn.className = 'modal-button';
        backBtn.textContent = 'Back';
        backBtn.style.marginRight = '10px';
        backBtn.onclick = () => renderStep(stepIndex - 1);
        btnContainer.appendChild(backBtn);
      }

      const nextBtn = document.createElement('button');
      nextBtn.className = 'modal-button';
      nextBtn.textContent = stepIndex === steps.length - 1 ? 'Finish' : 'Next';
      nextBtn.onclick = () => {
        if (stepIndex === steps.length - 1) {
          // Collect all inputs
          const results = {};
          steps.forEach((s, i) => {
            if (s.type === 'input' && s.inputElement) {
              results[s.name || `step${i}`] = s.inputElement.value;
            }
          });
          if (step.onComplete) {
            step.onComplete(results);
          }
          this.hideModal();
        } else {
          renderStep(stepIndex + 1);
        }
      };
      btnContainer.appendChild(nextBtn);

      stepContent.appendChild(btnContainer);
    };

    renderStep(currentStep);
    container.appendChild(stepContent);
    this.showModal(title, container);
  }
}
