<?php

namespace AppBundle\Command;

use AppBundle\Service;
use AppBundle\Model;
use Doctrine\CouchDB;
use Symfony\Component\Console\Input;
use Symfony\Component\Console\Output;

class CreateLabelStructure extends Base
{
    public function __construct()
    {
        parent::__construct();
    }

    protected function configure()
    {
        $this->setName('annostation:structure:create')
            ->setDescription('Create a label structure')
            ->addArgument('type', Input\InputArgument::REQUIRED, 'vehicle or pedestrian');
    }

    protected function execute(Input\InputInterface $input, Output\OutputInterface $output)
    {
        $type = $input->getArgument('type');

        switch ($type) {
            case 'vehicle':
                $this->createVehicleStructure();
                break;
            case 'pedestrian':
                $this->createPedestrianStructure();
                $this->writeError($output, "Pedestrian structure not implemented yet!");
                break;
            default:
                $this->writeError($output, "Type '$type' is not supported!");
        }
    }

    private function createVehicleStructure()
    {
        $vehicles = array(
            array(
                'name' => 'car',
                'response' => 'Car'
            ),
            array(
                'name' => 'truck',
                'response' => 'Truck'
            ),
            array(
                'name' => '2-wheeler-vehicle',
                'response' => '2 wheeler vehicle'
            ),
            array(
                'name' => 'bus',
                'response' => 'Bus'
            ),
            array(
                'name' => 'misc-vehicle',
                'response' => 'Misc vehicle'
            ),
            array(
                'name' => 'ignore-vehicle',
                'response' => 'Ignore vehicle'
            ),
        );

        $directions = array(
            array(
                'name' => 'direction-right',
                'response' => 'Right'
            ),
            array(
                'name' => 'direction-left',
                'response' => 'Left'
            ),
            array(
                'name' => 'direction-front',
                'response' => 'Front'
            ),
            array(
                'name' => 'direction-back',
                'response' => 'Back'
            ),
        );

        $occlusions = array(
            array(
                'name' => 'occlusion-20',
                'response' => '< 20%'
            ),
            array(
                'name' => 'occlusion-20-80',
                'response' => '20% - 80%'
            ),
            array(
                'name' => 'occlusion-80',
                'response' => '> 80%'
            ),
        );

        $truncations = array(
            array(
                'name' => 'truncation-20',
                'response' => '< 20%'
            ),
            array(
                'name' => 'truncation-20-80',
                'response' => '20% - 80%'
            ),
            array(
                'name' => 'truncation-80',
                'response' => '> 80%'
            ),
        );


        $data = array(
            array(
                'name' => 'vehicle-type',
                'challenge' => 'Vehicle Type',
                'children' => $vehicles,
            ),
            array(
                'name' => 'direction',
                'challenge' => 'Direction',
                'children' => $directions,
            ),
            array(
                'name' => 'occlusion',
                'challenge' => 'Occlusion',
                'children' => $occlusions,
            ),
            array(
                'name' => 'truncation',
                'challenge' => 'Truncation',
                'children' => $truncations,
            ),
        );

        file_put_contents(
            sprintf('%s/../Resources/LabelStructures/%s', __DIR__, 'object-labeling-vehicle.json'),
            json_encode($this->buildBackendLabelStructure($data))
        );
        file_put_contents(
            sprintf('%s/../Resources/LabelStructures/%s', __DIR__, 'object-labeling-vehicle-ui.json'),
            json_encode($this->buildFrontendLabelStructure($data))
        );
    }

    private function createPedestrianStructure()
    {
        // TODO: Implement createPedestrianStructure() method.
    }

    private function buildBackendLabelStructure(array $data)
    {
        $structure = array(
            'name' => 'root',
            'children' => $this->buildBackendLabelStructureHelper($data),
        );

        return $structure;
    }

    private function buildBackendLabelStructureHelper(array $data)
    {
        $children = array();
        foreach ($data as $leaf) {
            $child = array('name' => $leaf['name']);
            if (isset($leaf['children'])) {
                $child['children'] = $this->buildBackendLabelStructureHelper($leaf['children']);
            }
            $children[] = $child;
        }

        return $children;
    }

    private function buildFrontendLabelStructure(array $data)
    {
        $children = array();
        foreach ($data as $leaf) {
            $children[$leaf['name']] = array();
            if (isset($leaf['response'])) {
                $children[$leaf['name']]['response'] = $leaf['response'];
            }
            if (isset($leaf['challenge'])) {
                $children[$leaf['name']]['challenge'] = $leaf['challenge'];
            }
            if (isset($leaf['children'])) {
                $children = array_merge($children, $this->buildFrontendLabelStructure($leaf['children']));
            }
        }

        return $children;
    }
}