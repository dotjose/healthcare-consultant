"""Explicit errors for intake / AI pipeline (converted to HTTP responses in routes)."""


class ConfigurationError(Exception):
    """Missing or invalid service configuration (e.g. API key)."""

    def __init__(self, message: str = "Service configuration is incomplete."):
        self.message = message
        super().__init__(message)
