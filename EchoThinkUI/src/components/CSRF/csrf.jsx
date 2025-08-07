export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

export async function getCSRFToken() {
  await fetch("https://cidivan-production.up.railway.app/api/csrf/", {
    method: "GET",
    credentials: "include", // necessário para cookie ser setado
  });
}

export async function isAuthenticated() {
  const response = await fetch("https://cidivan-production.up.railway.app/me/", {
    method: "GET",
    credentials: "include",
  });

  return response.status === 200;
}

