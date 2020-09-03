function ModalService() {
    let initCompleted = false;

    this.init = async () => {
        if (initCompleted) {
            return true;
        }
        const modalContainerId = 'modal-container';
        let modalEl = document.querySelector(`#${modalContainerId}`);
        if (modalEl) {
            initCompleted = true;
            return true;
        }
        modalEl = document.createElement('div');
        modalEl.id = modalContainerId;
        modalEl.style.visibility = 'hidden';
        modalEl.style.position = 'fixed';
        modalEl.style.position = '-10000px';
        document.body.appendChild(modalEl);
        modalEl.innerHTML = (await (await fetch('lib/modals.html')).text());
        modalEl.childNodes.forEach(m => {
           document.body.appendChild(m.cloneNode(true));
           modalEl.removeChild(m);
        });
        modalEl.parentNode.removeChild(modalEl);
    }

    this.show = async (modalId, variables={}) => {
        if (!initCompleted) {
            await this.init();
        }
        const modalSelector = `#modal-${modalId}`;
        $(modalSelector).modal({backdrop: true, keyboard: true, focus: true, show: true});
        const modal = document.querySelector(modalSelector);
        const renderer = new Renderer(modal, variables);
        renderer.render(modal);
    }
}
