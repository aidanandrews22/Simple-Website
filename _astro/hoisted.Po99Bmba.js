function s(r, t) {
    const e = document.createElement(r);
    return t && typeof t == "string" && t !== "" && (e.textContent = t),
    t && typeof t == "object" && Object.keys(t).forEach(i=>{
        e.setAttribute(i, t[i])
    }
    ),
    e
}
function h(r, t, e) {
    r.addEventListener(t, e)
}
function C(r) {
    const t = r.match(/\w+$/)?.[0] ?? "";
    return t === "" || t.length > 1 ? "" : t.toUpperCase()
}
const v = ["Control", "Shift", "Alt", "Meta"]
  , g = ["Control+T", "Control+Shift+T", "Control+W", "Control+Shift+W", "Control+N", "Control+Shift+N", "Control+Tab", "Control+Shift+Tab", "Meta+T", "Meta+Shift+T", "Meta+W", "Meta+Shift+W", "Meta+N", "Meta+Shift+N", "Meta+Tab", "Meta+Shift+Tab"];
function w(r) {
    const t = r.match(/\w+/g) ?? [];
    if (t.length === 0)
        return !1;
    const e = t.map(i=>i.toUpperCase() === "CTRL" ? "Control" : i.toUpperCase() === "CMD" ? "Meta" : i[0].toUpperCase() + i.slice(1).toLowerCase()).join("+");
    return !g.includes(e) && e.split("+").slice(0, -1).every(i=>v.includes(i))
}
class E {
    instance;
    #o = null;
    #t = null;
    #e = [];
    currentIndex = 0;
    #i = "Escape";
    #r;
    #s = "K";
    #n = "Search command";
    #a = "black";
    #d = new MutationObserver(this.#y.bind(this));
    constructor({closeKey: t, placeholder: e, activationLetter: i}={}) {
        if (document.getElementById("hotkeypad") == null)
            throw new Error("HotKeyPad instance not found in the DOM");
        return this.instance = document.getElementById("hotkeypad"),
        this.#r = navigator.userAgent.includes("Macintosh") ? "Cmd" : "Ctrl",
        t && t !== "" && (this.#i = t),
        e && e !== "" && (this.#n = e),
        i && i !== "" && (this.#s = i),
        this.#p(),
        this.#u(),
        this
    }
    #u() {
        h(document, "keydown", t=>{
            const e = `Key${this.#s.toUpperCase()}`;
            t.code === e && (t.metaKey || t.ctrlKey) && (t.preventDefault(),
            this.#k ? this.close() : this.open()),
            t.key.toLowerCase() === this.#i.toLowerCase() && this.close()
        }
        ),
        this.#d.observe(this.instance, {
            attributes: !0,
            attributeFilter: ["class"],
            childList: !1,
            characterData: !1
        }),
        this.#g(),
        this.#w(),
        this.#E(),
        this.#A()
    }
    #p() {
        this.instance.hasAttribute("data-placeholder") && this.instance.getAttribute("data-placeholder") !== "" && (this.#n = this.instance.getAttribute("data-placeholder")),
        this.instance.hasAttribute("data-activation-letter") && this.instance.getAttribute("data-activation-letter") !== "" && (this.#s = this.instance.getAttribute("data-activation-letter").toUpperCase()),
        this.instance.hasAttribute("data-close-key") && this.instance.getAttribute("data-close-key") !== "" && (this.#i = this.instance.getAttribute("data-close-key").toUpperCase())
    }
    #y(t) {
        const {attributeName: e, target: i} = t[0];
        e === "class" && (i.classList.contains("dark") ? this.#a = "white" : this.#a = "black",
        this.#h())
    }
    #f() {
        h(this.instance, "keydown", t=>{
            (t.metaKey || t.ctrlKey) && this.#e.find(({hotkey: e, handler: i})=>{
                const n = `Key${C(e)}`;
                return t.code === n && (t.preventDefault(),
                i != null && setTimeout(()=>i(), 200),
                this.close()),
                !1
            }
            )
        }
        ),
        h(this.#t, "click", t=>{
            const e = t.target;
            e.tagName === "LI" && this.#c(e),
            e.parentElement?.tagName === "LI" && this.#c(e.parentElement)
        }
        ),
        h(this.#t, "mouseover", t=>{
            const e = t.target;
            e.tagName === "LI" && (this.#l.forEach(i=>i.removeAttribute("data-active")),
            e.setAttribute("data-active", ""))
        }
        ),
        h(this.#t, "keydown", t=>{
            const e = this.#l;
            this.currentIndex = Array.from(e).findIndex(o=>o.hasAttribute("data-active")),
            this.currentIndex = this.currentIndex === -1 ? 0 : this.currentIndex;
            let i = 0;
            t.key === "Enter" && (t.preventDefault(),
            this.#c(e[this.currentIndex]),
            e[this.currentIndex].removeAttribute("data-active"),
            this.currentIndex = 0),
            t.key === "ArrowUp" && (t.preventDefault(),
            i = this.currentIndex - 1 < 0 ? e.length - 1 : this.currentIndex - 1),
            t.key === "ArrowDown" && (t.preventDefault(),
            i = this.currentIndex + 1 > e.length - 1 ? 0 : this.currentIndex + 1),
            t.key === "Tab" && (t.preventDefault(),
            i = this.currentIndex + 1 > e.length - 1 ? 0 : this.currentIndex + 1),
            e[this.currentIndex].removeAttribute("data-active"),
            e[i].setAttribute("data-active", "")
        }
        ),
        h(this.#t, "input", t=>{
            const i = t.target.value.toLowerCase();
            this.#t.querySelectorAll("[data-section]").forEach(n=>{
                const a = n.querySelector("ul");
                a.querySelectorAll("li").forEach(l=>{
                    l.querySelector("p").innerText.toLowerCase().includes(i) ? l.style.display = "flex" : l.style.display = "none"
                }
                ),
                a.querySelectorAll("li[style='display: flex;']").length === 0 ? n.style.display = "none" : n.style.display = "block"
            }
            )
        }
        )
    }
    #c(t) {
        this.#e.find(({hotkey: e, handler: i})=>(t.getAttribute("data-hotkey") === e && (i != null && setTimeout(()=>i(), 200),
        this.close()),
        !1))
    }
    #m(t) {
        if (t.length === 0)
            throw new Error("The commands array cannot be empty");
        return t.forEach(e=>{
            if (e.id === "" || e.title === "" || e.hotkey === "" || e.handler == null)
                throw new Error("The command object is not valid. It should contain an id, title, hotkey and handler");
            if (!w(e.hotkey))
                throw new Error("The hotkey is not valid. It should only contain CTRL, CMD, ALT, SHIFT and a letter. Also it cannot contain browser or system reserved hotkeys such as CTRL+T, CTRL+N, CTRL+W, etc.");
            if (e.icon != null && typeof e.icon != "string")
                throw new Error("The icon should be a string");
            if ((e.hotkey.match(/\w+/g) ?? []).length > 2)
                throw new Error("The hotkey only supports 2 keys maximum")
        }
        ),
        t
    }
    open() {
        window.dispatchEvent(new CustomEvent("hotkeypad:open")),
        this.instance.style.opacity = "1",
        this.instance.style.visibility = "visible",
        this.instance.style.pointerEvents = "auto",
        setTimeout(()=>this.#t.querySelector("input").focus(), 200)
    }
    close() {
        window.dispatchEvent(new CustomEvent("hotkeypad:close")),
        this.instance.style.opacity = "0",
        this.instance.style.visibility = "hidden",
        this.instance.style.pointerEvents = "none",
        this.#t.querySelector("input").value = "",
        this.#t.removeEventListener("keydown", ()=>{}
        ),
        this.#t.removeEventListener("mouseover", ()=>{}
        ),
        this.#t.removeEventListener("input", ()=>{}
        )
    }
    setCommands(t) {
        this.#e = this.#m(t),
        this.#h(),
        this.#f()
    }
    get #k() {
        return this.instance.style.visibility === "visible"
    }
    get activationKey() {
        return this.#r
    }
    get #b() {
        const t = new Map;
        return this.#e.forEach(e=>{
            const i = typeof e.section != "string" || e.section === "" ? "Unlisted" : e.section
              , {section: o, ...n} = e
              , a = t.get(i);
            a ? a.push(n) : t.set(i, [n])
        }
        ),
        Array.from(t)
    }
    get #l() {
        return this.#t.querySelectorAll("li")
    }
    #C(t) {
        return `https://cdn.simpleicons.org/${t}/${this.#a}`
    }
    #v(t) {
        return /<svg/.test(t) || /<img/.test(t) || /<i/.test(t) || t === ""
    }
    #g() {
        this.#o = s("div", {
            "data-backdrop": "",
            "aria-hidden": "true"
        }),
        h(this.#o, "click", ()=>this.close()),
        this.instance.appendChild(this.#o)
    }
    #w() {
        this.#t = s("div", {
            "data-container": ""
        }),
        this.instance.appendChild(this.#t)
    }
    #E() {
        const t = s("header")
          , e = s("input", {
            type: "text",
            placeholder: this.#n,
            "aria-label": this.#n,
            autocomplete: "off",
            spellcheck: "false"
        });
        t.appendChild(e),
        this.#t.appendChild(t)
    }
    #A() {
        const t = s("footer")
          , e = s("kbd", "↩")
          , i = s("kbd", "↑")
          , o = s("kbd", "↓")
          , n = s("kbd", this.#i)
          , a = s("kbd", `${this.#r} + ${this.#s}`)
          , c = s("p", " to select")
          , d = s("p", " to navigate")
          , l = s("p", " to close");
        c.prepend(e),
        d.prepend(i, o),
        l.prepend(a, n),
        t.append(c, d, l),
        this.#t.appendChild(t)
    }
    #I() {
        const t = s("div");
        t.setAttribute("data-sections", ""),
        this.#b.forEach(([e,i])=>{
            const o = s("div");
            if (o.setAttribute("data-section", e.toLowerCase()),
            e !== "Unlisted") {
                const a = s("h4", e);
                o.appendChild(a)
            }
            const n = s("ul");
            i.forEach(({title: a, icon: c, hotkey: d})=>{
                const l = d.split("+").map(p=>p.trim());
                c == null && (c = "");
                const y = this.#v(c) ? c : `<img src="${this.#C(c)}" alt="${a}" />`
                  , u = s("li");
                if (u.setAttribute("data-hotkey", d),
                u.setAttribute("tabindex", "0"),
                y !== "") {
                    const p = s("span");
                    p.innerHTML = y,
                    u.appendChild(p)
                }
                const f = s("p");
                f.append(a);
                const m = s("div");
                l.forEach(p=>{
                    const b = s("span", p);
                    m.appendChild(b)
                }
                ),
                u.appendChild(f),
                u.appendChild(m),
                n.appendChild(u)
            }
            ),
            o.appendChild(n),
            t.appendChild(o)
        }
        ),
        this.#t.insertBefore(t, this.#t.lastChild)
    }
    #h() {
        const t = this.#t.querySelector("[data-sections]");
        t && t.remove(),
        this.#I(),
        this.#l[0].setAttribute("data-active", "")
    }
}
const k = new E
  , A = k.instance.getAttribute("data-info") ?? "[]"
  , I = JSON.parse(A)
  , L = I.map(({url: r, hotkey: t, icon: e, id: i, section: o, title: n})=>({
    id: i,
    title: n,
    icon: e,
    hotkey: t,
    section: o,
    handler: ()=>{
        window.open(r, "_blank")
    }
}));
k.setCommands([{
    id: "print",
    title: "Imprimir",
    icon: `<svg style="margin-right: 8px" width="16" height="16" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
  <path stroke-linecap="round" stroke-linejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
</svg>`,
    hotkey: "ctrl+P",
    section: "Acciones",
    handler: ()=>{
        window.print()
    }
}, ...L]);
const T = document.getElementById("footer-button");
T?.addEventListener("click", ()=>{
    var r = new KeyboardEvent("keydown",{
        key: "K",
        code: "KeyK",
        keyCode: 75,
        which: 75,
        ctrlKey: !0,
        altKey: !1,
        shiftKey: !1,
        metaKey: !1
    });
    document.dispatchEvent(r)
}
);


