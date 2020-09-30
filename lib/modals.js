function ModalService() {
    let initCompleted = false;

    function randomModalId(prefix = '') {
        let modalId;
        do {
            let r = Math.random().toString(36).substring(7);
            modalId = `modal-${prefix}-${r}`;
        } while (document.getElementById(modalId));
        return modalId;
    }

    this.init = async () => {
        if (initCompleted) {
            return true;
        }
        const modalContainerId = 'modal-container';
        let modalEl = document.querySelector(`#${modalContainerId}`);
        if (modalEl || document.querySelector('.modal-imported') !== null) {
            initCompleted = true;
            return true;
        }
        modalEl = document.createElement('div');
        modalEl.id = modalContainerId;
        document.body.appendChild(modalEl);
        modalEl.innerHTML = (await (await fetch('lib/modals.html')).text());
        while (modalEl.childElementCount) {
            const child = modalEl.firstElementChild;
            child.classList.add('modal-imported');
            modalEl.removeChild(child);
            document.body.appendChild(child);
        }
        modalEl.parentNode.removeChild(modalEl);
    }

    this.show = async (modalId, variables = {}, functions = {}) => {
        if (!initCompleted) {
            await this.init();
        }
        const modalSelector = `#modal-${modalId}`;
        $(modalSelector).modal({backdrop: true, keyboard: true, focus: true, show: true});
        const modal = document.querySelector(modalSelector);
        const renderer = new Renderer(modal, variables, null, functions);
        renderer.render(modal);
        await new Promise((resolve) => {
            $(modalSelector).on('hidden.bs.modal', () => resolve());
        });
    }

    this.alert = async (message, title = 'Message', type = 'info') => {
        if (!initCompleted) {
            await this.init();
        }
        const modalId = randomModalId('alert');
        const modalEl = document.createElement('div');
        modalEl.id = modalId;
        modalEl.className = 'modal';
        modalEl.setAttribute('tabindex', '-1');
        modalEl.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>`;
        document.body.appendChild(modalEl);
        $(`#${modalId}`).modal({backdrop: true, keyboard: true, focus: true, show: true});
        await new Promise((resolve) => {
            $(`#${modalId}`).on('hidden.bs.modal', () => {
                modalEl.parentNode.removeChild(modalEl);
                resolve();
            });
        });
    }
}
