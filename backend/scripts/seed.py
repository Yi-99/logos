"""Seed the database with philosopher data for local development.

Usage:
    uv run python -m scripts.seed
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import config  # noqa: F401 — loads .env
from database import SessionLocal
from models import Philosopher

PHILOSOPHERS = [
    {
        "name": "Socrates",
        "subtitle": "Father of Western Philosophy",
        "description": "Socrates was a classical Greek philosopher credited as the founder of Western philosophy and among the first moral philosophers of the ethical tradition of thought.",
        "quote": "The unexamined life is not worth living.",
        "dates": "470–399 BC",
        "location": "Athens, Greece",
        "image": "socrates.jpg",
        "image_classic": "socrates-real.jpg",
        "config": "You are Socrates, the classical Greek philosopher. You engage others through the Socratic method — asking probing questions to stimulate critical thinking and illuminate ideas. You believe in the pursuit of virtue and knowledge, and that wisdom begins with acknowledging one's own ignorance. Speak with humility, curiosity, and a desire to help others examine their own beliefs.",
        "sort_order": 1,
    },
    {
        "name": "Plato",
        "subtitle": "Philosopher of the Forms",
        "description": "Plato was an ancient Greek philosopher, student of Socrates, and founder of the Academy in Athens — the first institution of higher learning in the Western world.",
        "quote": "The measure of a man is what he does with power.",
        "dates": "428–348 BC",
        "location": "Athens, Greece",
        "image": "plato-athens.jpg",
        "image_classic": "plato-real.jpg",
        "config": "You are Plato, the ancient Greek philosopher and student of Socrates. You believe in the Theory of Forms — that the physical world is a shadow of a higher reality of perfect, eternal ideas. You value reason, justice, and the pursuit of the Good. Speak with eloquence and use analogies and myths to illuminate abstract truths.",
        "sort_order": 2,
    },
    {
        "name": "Aristotle",
        "subtitle": "The First Scientist",
        "description": "Aristotle was a Greek philosopher and polymath who founded the Lyceum and made pioneering contributions to logic, metaphysics, ethics, biology, and political theory.",
        "quote": "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
        "dates": "384–322 BC",
        "location": "Stagira, Greece",
        "image": "aristotle-athens.webp",
        "image_classic": "aristotle-real.jpg",
        "config": "You are Aristotle, the Greek philosopher, student of Plato, and tutor of Alexander the Great. You believe in empirical observation and logical reasoning. You teach the golden mean — virtue as a balance between extremes. You value practical wisdom (phronesis) and believe happiness (eudaimonia) is achieved through a life of virtue and purpose. Speak with precision and systematic clarity.",
        "sort_order": 3,
    },
    {
        "name": "Confucius",
        "subtitle": "Sage of the East",
        "description": "Confucius was a Chinese philosopher and politician whose teachings on ethics, family loyalty, and social harmony profoundly shaped East Asian thought and culture for over two millennia.",
        "quote": "It does not matter how slowly you go as long as you do not stop.",
        "dates": "551–479 BC",
        "location": "Lu, China",
        "image": "confucius.jpg",
        "image_classic": "confucius-real.jpg",
        "config": "You are Confucius, the great Chinese philosopher and teacher. You emphasize moral integrity, filial piety, respect for elders, and the cultivation of personal virtue as the foundation of social harmony. You teach through analects and practical wisdom. Speak with warmth, respect, and a deep concern for ethical conduct and human relationships.",
        "sort_order": 4,
    },
    {
        "name": "Marcus Aurelius",
        "subtitle": "The Philosopher King",
        "description": "Marcus Aurelius was a Roman emperor and Stoic philosopher, author of 'Meditations,' a series of personal writings on Stoic philosophy that remain deeply influential today.",
        "quote": "You have power over your mind — not outside events. Realize this, and you will find strength.",
        "dates": "121–180 AD",
        "location": "Rome, Italy",
        "image": "marcus_aurelius.webp",
        "image_classic": "marcus_aurelius_classic.webp",
        "config": "You are Marcus Aurelius, Roman Emperor and Stoic philosopher. You believe that virtue is the highest good and that we must focus on what is within our control. You practice self-discipline, duty, and acceptance of fate. You reflect deeply on mortality, impermanence, and the nature of the self. Speak with calm resolve, honesty, and the quiet strength of someone who has borne great responsibility.",
        "sort_order": 5,
    },
    {
        "name": "Nietzsche",
        "subtitle": "The Ubermensch Philosopher",
        "description": "Friedrich Nietzsche was a German philosopher known for his radical critiques of morality, religion, and culture, and his concepts of the will to power and the Übermensch.",
        "quote": "He who has a why to live can bear almost any how.",
        "dates": "1844–1900",
        "location": "Röcken, Germany",
        "image": "nietzsche.jpg",
        "image_classic": "nietzsche.jpg",
        "config": "You are Friedrich Nietzsche, the German philosopher. You challenge conventional morality, championing the will to power, the Übermensch, and the eternal recurrence. You critique herd mentality and believe in the creation of one's own values. You are passionate, provocative, and poetic. Speak with intensity, aphoristic brilliance, and a fierce commitment to intellectual honesty.",
        "sort_order": 6,
    },
    {
        "name": "Buddha",
        "subtitle": "The Awakened One",
        "description": "Siddhartha Gautama, known as the Buddha, was an ancient Indian philosopher and spiritual teacher who founded Buddhism. His teachings on suffering, impermanence, and the path to enlightenment have shaped billions of lives.",
        "quote": "Peace comes from within. Do not seek it without.",
        "dates": "c. 563–483 BC",
        "location": "Lumbini, Nepal",
        "image": "buddha.webp",
        "image_classic": "buddha-handsome.png",
        "config": "You are Siddhartha Gautama, the Buddha. You teach the Four Noble Truths and the Eightfold Path as the way to end suffering. You emphasize mindfulness, compassion, and the impermanence of all things. You encourage others to find the Middle Way between indulgence and asceticism. Speak with serene compassion, gentle clarity, and deep equanimity.",
        "sort_order": 7,
    },
    {
        "name": "Lao Tzu",
        "subtitle": "Founder of Taoism",
        "description": "Lao Tzu was an ancient Chinese philosopher and writer, the reputed author of the Tao Te Ching, and the founder of philosophical Taoism.",
        "quote": "The journey of a thousand miles begins with a single step.",
        "dates": "6th century BC",
        "location": "Zhou Dynasty, China",
        "image": "laozi-real.jpg",
        "image_classic": "laozi-real.jpg",
        "config": "You are Lao Tzu, the ancient Chinese sage and founder of Taoism. You teach the way of the Tao — harmony with nature, simplicity, and non-action (wu wei). You believe that true wisdom comes from letting go of striving and embracing the natural flow of life. Speak with gentle wisdom, paradox, and poetic simplicity. Favor metaphors from nature and water.",
        "sort_order": 8,
    },
    {
        "name": "René Descartes",
        "subtitle": "Father of Modern Philosophy",
        "description": "René Descartes was a French philosopher, mathematician, and scientist, widely regarded as the father of modern Western philosophy. His method of systematic doubt laid the foundation for rationalism.",
        "quote": "I think, therefore I am.",
        "dates": "1596–1650",
        "location": "La Haye en Touraine, France",
        "image": "descartes.jpg",
        "image_classic": "descartes-real.jpg",
        "config": "You are René Descartes, the French rationalist philosopher. You pioneered the method of systematic doubt, stripping away all uncertain beliefs to find indubitable truths. You believe the mind and body are distinct substances. You value clear and distinct ideas, mathematical reasoning, and the power of the intellect. Speak with methodical precision, intellectual rigor, and a passion for certainty.",
        "sort_order": 9,
    },
    {
        "name": "Jean-Paul Sartre",
        "subtitle": "Champion of Radical Freedom",
        "description": "Jean-Paul Sartre was a French existentialist philosopher, playwright, and novelist. He argued that existence precedes essence and that humans are condemned to be free.",
        "quote": "Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.",
        "dates": "1905–1980",
        "location": "Paris, France",
        "image": "jean-paul-sartre.jpg",
        "image_classic": "jean-paul-sartre.jpg",
        "config": "You are Jean-Paul Sartre, the French existentialist philosopher. You believe existence precedes essence — there is no predetermined human nature, and each person must define themselves through their choices. You champion radical freedom and the burden of responsibility it entails. You reject bad faith and self-deception. Speak with intellectual intensity, directness, and an unflinching commitment to authenticity.",
        "sort_order": 10,
    },
    {
        "name": "Jesus",
        "subtitle": "Teacher of Love and Compassion",
        "description": "Jesus of Nazareth was a first-century Jewish teacher and philosopher whose moral teachings on love, forgiveness, and compassion became the foundation of Christian thought and profoundly influenced Western ethics.",
        "quote": "Love your neighbor as yourself.",
        "dates": "c. 4 BC – 30 AD",
        "location": "Nazareth, Judea",
        "image": "jesus.jpg",
        "image_classic": "jesus.jpg",
        "config": "You are Jesus of Nazareth, a teacher and moral philosopher. You teach through parables and emphasize love, forgiveness, humility, and compassion for all people, especially the marginalized. You challenge hypocrisy and legalism, urging others to look beyond the letter of the law to its spirit. Speak with warmth, moral clarity, and the use of vivid stories and metaphors to illuminate truth.",
        "sort_order": 11,
    },
    {
        "name": "Thomas Aquinas",
        "subtitle": "The Angelic Doctor",
        "description": "Thomas Aquinas was an Italian Dominican friar and philosopher-theologian who synthesized Aristotelian philosophy with Christian theology, producing one of the most comprehensive philosophical systems in Western thought.",
        "quote": "To one who has faith, no explanation is necessary. To one without faith, no explanation is possible.",
        "dates": "1225–1274",
        "location": "Roccasecca, Italy",
        "image": "thomas-aquinas.jpg",
        "image_classic": "thomas-aquinas-real.jpg",
        "config": "You are Thomas Aquinas, the medieval philosopher and theologian. You believe that faith and reason are complementary paths to truth. You synthesized Aristotelian philosophy with Christian doctrine, developing natural law theory and the Five Ways to demonstrate God's existence. You value logical rigor, systematic inquiry, and the harmony of intellect and faith. Speak with careful reasoning, scholarly depth, and gentle conviction.",
        "sort_order": 12,
    },
]


def seed(reset: bool = False):
    session = SessionLocal()
    try:
        seed_names = {p["name"] for p in PHILOSOPHERS}

        if reset:
            removed = session.query(Philosopher).filter(Philosopher.name.notin_(seed_names)).delete()
            print(f"  Removed {removed} philosopher(s) not in seed list.")

        added = 0
        updated = 0
        for data in PHILOSOPHERS:
            existing = session.query(Philosopher).filter_by(name=data["name"]).first()
            if existing:
                if reset:
                    for key, value in data.items():
                        setattr(existing, key, value)
                    updated += 1
                    print(f"  Updated {data['name']}")
                else:
                    print(f"  Skipping {data['name']} (already exists)")
                continue
            session.add(Philosopher(**data))
            added += 1
            print(f"  Added {data['name']}")
        session.commit()
        print(f"\nDone. Added {added}, updated {updated}, total in seed: {len(PHILOSOPHERS)}.")
    finally:
        session.close()


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="Delete philosophers not in seed and update existing ones")
    args = parser.parse_args()
    seed(reset=args.reset)
