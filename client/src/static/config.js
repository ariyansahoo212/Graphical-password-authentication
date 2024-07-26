export const api = {
    // url: "https://graphical-pass-backend.vercel.app"
    url: process.env.NODE_ENV =="development"? "http://localhost:5000":"https://graphical-password-authentication-1bln.onrender.com"
    //url:"https://crazy-fish-tights.cyclic.app"
    // url: "https://graphical-auth-server.onrender.com"
}
