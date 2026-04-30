{pkgs ? import <nixpkgs> {}}:
pkgs.mkShell {
  buildInputs = [
    (pkgs.python3.withPackages (ps:
      with ps; [
        fastapi
        uvicorn
        pydantic
        requests
        sqlalchemy
        python-dotenv
        mysql-connector

        # required for FastAPI file uploads
        python-multipart
      ]))
  ];
}
