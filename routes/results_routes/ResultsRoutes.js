const router = require('express').Router()
const Result = require('../../apis/results_api/ResultsApi')


router.get('/:reg',Result.r13results)
router.get('/response/check',Result.results)

module.exports = router