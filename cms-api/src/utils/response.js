function ok(res, data = null, message = "Success", status = 200) {
  return res.status(status).json({ success: true, message, data });
}

function exist(res, data = null, message = "Already exists", status = 409) {
  return res.status(status).json({ success: false, message, data });
}

function notFound(res, data = null, message = "Success", status = 404) {
  return res.status(status).json({ success: false, message, data });
}

function fail(
  res,
  message = "Something went wrong",
  status = 500,
  errors = null,
) {
  return res.status(status).json({ success: false, message, errors });
}

module.exports = { ok, exist, notFound, fail };
