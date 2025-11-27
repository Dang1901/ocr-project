from datetime import datetime
from typing import Optional

import inject
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from starlette.routing import Route

from app.repository.activity_log.activity_log_interface import ActivityLogInterface


class ActivityLogMiddleware(BaseHTTPMiddleware):
    repository: ActivityLogInterface = inject.attr(ActivityLogInterface)

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        response = await call_next(request)

        full_path = request.url.path
        if request.url.query:
            full_path += "?" + request.url.query

        maybe_route: Optional[Route] = request.scope.get("route")
        if maybe_route and isinstance(maybe_route, Route):
            maybe_route = maybe_route
        else:
            maybe_route = None

        name: Optional[str] = None

        if maybe_route:
            name = maybe_route.name

        user_uid = request.session.get("user_id")

        if name and name != "":
            self.repository.log(
                user_id=user_uid,
                path=full_path,
                method=request.method,
                time=datetime.now(),
                status=response.status_code,
                name=name,
            )

        return response