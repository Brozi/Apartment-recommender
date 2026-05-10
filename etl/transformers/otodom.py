import pandas as pd

class OtodomTransformer:
    """Handles the specific business logic for transforming Otodom listings."""
    @staticmethod
    def transform(raw_doc):
        clean_doc = raw_doc.copy()

        #the rest of the cleaning logic..

        return clean_doc