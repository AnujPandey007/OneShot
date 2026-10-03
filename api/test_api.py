import json
import os
from pathlib import Path
import tempfile
import unittest
from fastapi.testclient import TestClient
from train import train
from main import app


class TagApiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.model_path = str(Path(cls.temp.name) / 'model.joblib')
        train(Path(__file__).parent / 'data/demo.json', cls.model_path, demo=True)
        os.environ['MODEL_PATH'] = cls.model_path
        cls.context = TestClient(app)
        cls.client = cls.context.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.context.__exit__(None, None, None)
        os.environ.pop('MODEL_PATH', None)
        cls.temp.cleanup()

    def test_prediction_preserves_blog_tag_contract(self):
        result = self.client.post('/predict', json={
            'blogTitle': 'Cricket tournament',
            'blogText': 'The cricket team won the match with a wicket from the bowler.'})
        self.assertEqual(result.status_code, 200)
        data = result.json()
        self.assertEqual(data['blogTag'], 'Sports')
        self.assertTrue(data['demo'])
        self.assertTrue(data['needsReview'])
        self.assertEqual(len(data['suggestions']), 3)
        self.assertGreater(data['confidence'], 0)

    def test_unknown_vocabulary_abstains(self):
        data = self.client.post('/predict', json={'blogText': 'zzzzzz qqqqqq xxxxxx vvvvvv'}).json()
        self.assertIsNone(data['blogTag'])

    def test_invalid_content(self):
        for body in ({}, {'blogText': 'short'}, {'blogText': ' '*30}, {'blogText': 'x'*30001}, {'blogText': 123}):
            self.assertEqual(self.client.post('/predict', json=body).status_code, 422)

    def test_health_and_cors(self):
        self.assertEqual(self.client.get('/health').json(), {'status': 'ok', 'demo': True})
        headers={'Origin':'http://localhost:3000', 'Access-Control-Request-Method':'POST', 'Access-Control-Request-Headers':'content-type'}
        response=self.client.options('/predict', headers=headers)
        self.assertEqual(response.headers['access-control-allow-origin'], 'http://localhost:3000')
        headers['Origin']='https://unlisted.example'
        self.assertEqual(self.client.options('/predict', headers=headers).status_code, 400)

    def test_training_rejects_invalid_labels(self):
        path=Path(self.temp.name)/'bad.json'
        path.write_text(json.dumps([{'blogTitle':'Title','blogText':'Body','blogTag':'Invalid'}]))
        with self.assertRaises(ValueError):
            train(path, self.model_path)


if __name__ == '__main__':
    unittest.main()
