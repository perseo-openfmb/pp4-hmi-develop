import asyncio
from nats.aio.client import Client as NATS

async def main():
    nc = NATS()

    await nc.connect("nats://localhost:4222")

    async def message_handler(msg):
        subject = msg.subject
        reply = msg.reply
        data = msg.data
        print(f"Received a message on '{data}'")
    await nc.subscribe("openfmb.metermodule.MeterReadingProfile.00000000-0000-0000-0000-000000000001", cb=message_handler)
    try:
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("Exiting...")
    await nc.close()
if __name__ == "__main__":

    asyncio.run(main())