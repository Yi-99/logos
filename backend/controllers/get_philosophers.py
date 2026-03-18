from dao import DAOFactory


def get_philosophers(dao: DAOFactory):
    """
    Get all philosophers
    """
    philosophers = dao.philosophers.get_all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "subtitle": p.subtitle,
            "description": p.description,
            "quote": p.quote,
            "dates": p.dates,
            "location": p.location,
            "image": p.image,
            "image_classic": p.image_classic,
            "config": p.config,
            "sort_order": p.sort_order,
            "number_of_prompts": p.number_of_prompts,
            "metaphysics_category": p.metaphysics_category,
        }
        for p in philosophers
    ]
