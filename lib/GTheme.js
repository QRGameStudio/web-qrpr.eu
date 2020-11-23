function GTheme() {
    const permanentStorage = GStorage ? new GStorage("theme") : null;

    this.get = () => localStorage.getItem("theme") || "light";

    this.apply = (theme=null) => {
        theme = theme ? theme : this.get();
        const oldClassed = [];
        document.body.classList.forEach((c) => {
           if (c.startsWith('theme-')) {
               oldClassed.push(c);
           }
        });
        oldClassed.forEach((c) => document.body.classList.remove(c));
        document.body.classList.add(`theme-${theme}`);
        switch (theme) {
            case 'dark':
                document.querySelectorAll('.card').forEach(e => e.classList.add('bg-dark'));
                document.querySelectorAll('.btn').forEach(e => e.classList.add('btn-dark'));
                break;
            case 'light':
                document.querySelectorAll('.card.bg-dark').forEach(e => e.classList.remove('bg-dark'));
                document.querySelectorAll('.btn.btn-dark').forEach(e => e.classList.remove('btn-dark'));
                break;
        }
    }

    this.save = async (theme) => {
        theme = theme ? theme : this.get();
        localStorage.setItem("theme", theme);
        if (!permanentStorage) {
            return false;
        }
        return await permanentStorage.set("theme", theme);
    }

    if (localStorage.getItem("theme") === null) {
        permanentStorage.get("theme", "light").then(this.save);
    }
}

// noinspection JSUnresolvedVariable
if (typeof $ !== 'undefined') {
    // noinspection JSUnresolvedFunction
    $(document).ready(() => new GTheme().apply())
}
