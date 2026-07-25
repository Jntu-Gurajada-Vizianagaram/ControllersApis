const router = require('express').Router()
const Result = require('../../apis/results_api/ResultsApi')


router.get('/response/check',Result.results)
router.get('/:reg',Result.r13results)

module.exports = router
