class LoginComponent extends HTMLElement{
    private form: HTMLFormElement;

    constructor(){
        super();
        this.form = this.querySelector("form");
    }

    private submitLoginForm:EventListener = async (e:Event) => {
        e.preventDefault();
        if (this.form.checkValidity()){
            const data = {
                // @ts-ignore
                email: this.form.querySelector(`[name="email"]`).value,
            };
            const request = await fetch("/api/v1/login", {
                method: "POST",
                body: JSON.stringify(data),
                headers: new Headers({
                    Accept: "application/json",
                    "Content-Type": "application/json",
                }),
            });
            const response = await request.json();
            console.log(response);
        }
    } 

    connectedCallback(){
        this.form.addEventListener("submit", this.submitLoginForm);
    }
}
customElements.define("login-component", LoginComponent);