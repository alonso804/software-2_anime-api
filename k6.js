from pymongo import MongoClient
import requests
import time

# Colors
HEADER = "\033[95m"
OKBLUE = "\033[94m"
OKCYAN = "\033[96m"
OKGREEN = "\033[92m"
WARNING = "\033[93m"
FAIL = "\033[91m"
ENDC = "\033[0m"
BOLD = "\033[1m"
UNDERLINE = "\033[4m"


class Logger:
    @staticmethod
    def info(msg):
        print(OKCYAN + "[INFO] " + ENDC + str(msg))

    @staticmethod
    def warn(msg):
        print(WARNING + "[WARN] " + ENDC + str(msg))

    @staticmethod
    def error(msg):
        print(FAIL + "[ERROR] " + ENDC + str(msg))

    @staticmethod
    def ok(msg):
        print(OKGREEN + "[OK] " + ENDC + str(msg))

    @staticmethod
    def stopError(msg):
        raise SystemExit(FAIL + "[ERROR] " + ENDC + str(msg))

    @staticmethod
    def stopInfo(msg):
        raise SystemExit(OKCYAN + "[INFO] " + ENDC + str(msg))


class Mongo:
    def __init__(self):
        self.client = MongoClient("mongodb://localhost:27017/")
        self.anime_api = self.client["anime-api"]["anime"]

        Logger.info("Connected to Evolution MongoDB")

    def __del__(self):
        self.client.close()
        Logger.info("Disconnected from Evolution MongoDB")


if __name__ == "__main__":
    Logger.info("Starting cron-job.py")
    URI = "https://api.jikan.moe/v4"

    mongo = Mongo()

    id = 130

    while id < 300:
        data = requests.get(f"{URI}/anime/{id}").json()

        if "status" in data and data["status"] == 429:
            Logger.warn(f"Rate limit exceeded, waiting 60 seconds")
            time.sleep(60)
            continue

        if "status" in data and data["status"] == 404:
            Logger.warn(f"Anime [{id}] not found")
            id += 1
            continue

        Logger.info(f"Inserting [{id}]: {data['data']['title']}")

        mongo.anime_api.insert_one(
            {
                "id": id,
                "title": data["data"]["title"],
                "type": data["data"]["type"],
                "source": data["data"]["source"],
                "episodes": data["data"]["episodes"],
                "status": data["data"]["status"],
                "airing": data["data"]["airing"],
            }
        )
        id += 1

        time.sleep(1)

    Logger.info("Finished cron-job.py")
