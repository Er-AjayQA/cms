const crypto = require("crypto");
const dns = require("dns").promises;
const tls = require("tls");

function normalizeHostname(hostname) {
  return String(hostname || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    .split(":")[0]
    .toLowerCase();
}

function generateDomainVerificationToken() {
  return `cms-verify=${crypto.randomBytes(24).toString("hex")}`;
}

function getVerificationTxtHost(hostname) {
  const normalizedHostname = normalizeHostname(hostname);
  return `_cms.${normalizedHostname}`;
}

async function verifyDomainDns(domain) {
  const hostname = normalizeHostname(domain.hostname);
  const txtHost = getVerificationTxtHost(hostname);
  const expectedToken = domain.verificationToken;

  if (!expectedToken) {
    return {
      verified: false,
      txtHost,
      error: "Verification token is missing.",
    };
  }

  try {
    const records = await dns.resolveTxt(txtHost);
    const values = records.map((record) => record.join(""));
    const verified = values.includes(expectedToken);

    return {
      verified,
      txtHost,
      records: values,
      error: verified
        ? null
        : `TXT record not found at ${txtHost}.`,
    };
  } catch (error) {
    return {
      verified: false,
      txtHost,
      records: [],
      error: error.message,
    };
  }
}

function checkSslStatus(domain) {
  const hostname = normalizeHostname(domain.hostname);

  return new Promise((resolve) => {
    const socket = tls.connect(
      {
        host: hostname,
        port: 443,
        servername: hostname,
        rejectUnauthorized: true,
        timeout: 10000,
      },
      () => {
        const certificate = socket.getPeerCertificate();
        socket.end();

        resolve({
          active: true,
          validTo: certificate.valid_to || null,
          issuer: certificate.issuer || null,
          error: null,
        });
      },
    );

    socket.on("timeout", () => {
      socket.destroy();
      resolve({
        active: false,
        error: "SSL check timed out.",
      });
    });

    socket.on("error", (error) => {
      resolve({
        active: false,
        error: error.message,
      });
    });
  });
}

module.exports = {
  generateDomainVerificationToken,
  getVerificationTxtHost,
  normalizeHostname,
  verifyDomainDns,
  checkSslStatus,
};
